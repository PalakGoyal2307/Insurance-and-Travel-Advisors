import { PDFParse } from 'pdf-parse'
import Tesseract from 'tesseract.js'

const OCR_LANGUAGE = 'eng'
const IGNORED_NAME_TOKENS = [
	'government of india',
	'govt of india',
	'male',
	'female',
	'dob',
	'date of birth',
	'year of birth',
	'aadhaar',
	'vid',
	'uidai',
	'address',
	'india',
]

const removeNoise = (value) => String(value || '')
	.replace(/[|_~`]/g, ' ')
	.replace(/\s+/g, ' ')
	.trim()

const normalizeDobToken = (value) => {
	const match = String(value || '').trim().match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/)
	if (!match) return null

	const day = Number(match[1])
	const month = Number(match[2])
	const year = Number(match[3])
	const date = new Date(Date.UTC(year, month - 1, day))

	if (
		Number.isNaN(date.getTime()) ||
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() + 1 !== month ||
		date.getUTCDate() !== day
	) {
		return null
	}

	const dd = String(day).padStart(2, '0')
	const mm = String(month).padStart(2, '0')
	return `${dd}-${mm}-${year}`
}

const extractDob = (text) => {
	const normalized = removeNoise(text)
	const labelMatch = normalized.match(/(?:DOB|Date of Birth|Year of Birth)\s*[:\-]?\s*(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{4})/i)
	if (labelMatch) {
		const parsed = normalizeDobToken(labelMatch[1])
		if (parsed) return parsed
	}

	const allDateMatches = normalized.match(/\b\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{4}\b/g) || []
	for (const candidate of allDateMatches) {
		const parsed = normalizeDobToken(candidate)
		if (parsed) return parsed
	}

	return null
}

const extractPincode = (text) => {
	const normalized = removeNoise(text)

	const labeled = normalized.match(/(?:PIN\s*CODE|PINCODE|PIN)\s*[:\-]?\s*(\d{6})/i)
	if (labeled) return labeled[1]

	return null
}

const isNameCandidate = (value) => {
	const cleaned = removeNoise(value)
	if (!cleaned) return false
	if (cleaned.length < 3 || cleaned.length > 70) return false
	if (/\d/.test(cleaned)) return false

	const lower = cleaned.toLowerCase()
	return !IGNORED_NAME_TOKENS.some((token) => lower.includes(token))
}

const toTitleCase = (value) => value
	.toLowerCase()
	.split(' ')
	.filter(Boolean)
	.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
	.join(' ')

const extractName = (text) => {
	const normalized = removeNoise(text)
	const directMatch = normalized.match(/(?:Name)\s*[:\-]\s*([A-Za-z][A-Za-z\s.]{1,68})/i)
	if (directMatch) {
		const parsed = removeNoise(directMatch[1])
		if (isNameCandidate(parsed)) return toTitleCase(parsed)
	}

	const lines = String(text || '')
		.split(/\r?\n/)
		.map((line) => removeNoise(line))
		.filter(Boolean)

	if (!lines.length) return null

	const dobLineIndex = lines.findIndex((line) => /(?:DOB|Date of Birth|Year of Birth)/i.test(line))
	if (dobLineIndex > 0) {
		for (let index = dobLineIndex - 1; index >= 0; index -= 1) {
			const candidate = lines[index]
			if (isNameCandidate(candidate)) {
				return toTitleCase(candidate)
			}
		}
	}

	for (const line of lines) {
		if (isNameCandidate(line)) {
			return toTitleCase(line)
		}
	}

	return null
}

const runTesseractOnImage = async (buffer) => {
	const result = await Tesseract.recognize(buffer, OCR_LANGUAGE)
	return String(result?.data?.text || '')
}

const extractTextFromPdf = async (buffer) => {
	const parser = new PDFParse({ data: buffer })
	try {
		const parsed = await parser.getText({ parsePageInfo: false })
		return String(parsed?.text || '')
	} finally {
		await parser.destroy().catch(() => undefined)
	}
}

export const extractAadhaarInfoFromFile = async ({ buffer, mimeType }) => {
	if (!buffer || !mimeType) {
		return null
	}

	let rawText = ''

	if (mimeType === 'application/pdf') {
		rawText = await extractTextFromPdf(buffer)
	} else if (/^image\//.test(mimeType)) {
		rawText = await runTesseractOnImage(buffer)
	} else {
		return null
	}

	const name = extractName(rawText)
	const dob = extractDob(rawText)
	const pincode = extractPincode(rawText)

	if (!name && !dob && !pincode) {
		return null
	}

	return {
		name,
		dob,
		pincode,
	}
}
