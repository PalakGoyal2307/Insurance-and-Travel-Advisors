export interface AadhaarOcrPayload {
	name?: string | null
	dob?: string | null
	pincode?: string | null
}

const normalizeDateToken = (value: string) => {
	const match = value.trim().match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/)
	if (!match) return ''

	const day = Number(match[1])
	const month = Number(match[2])
	const year = Number(match[3])
	const parsed = new Date(Date.UTC(year, month - 1, day))

	if (
		Number.isNaN(parsed.getTime()) ||
		parsed.getUTCFullYear() !== year ||
		parsed.getUTCMonth() + 1 !== month ||
		parsed.getUTCDate() !== day
	) {
		return ''
	}

	const dd = String(day).padStart(2, '0')
	const mm = String(month).padStart(2, '0')
	return `${dd}-${mm}-${year}`
}

const normalizeName = (value: string) => value
	.replace(/\s+/g, ' ')
	.trim()
	.split(' ')
	.filter(Boolean)
	.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
	.join(' ')

export const normalizeAadhaarOcrPayload = (value: AadhaarOcrPayload | null | undefined) => {
	if (!value || typeof value !== 'object') {
		return null
	}

	const name = typeof value.name === 'string' ? normalizeName(value.name) : ''
	const dob = typeof value.dob === 'string' ? normalizeDateToken(value.dob) : ''
	const pincode = typeof value.pincode === 'string' ? value.pincode.replace(/\D/g, '').slice(0, 6) : ''

	if (!name && !dob && !pincode) {
		return null
	}

	return {
		name,
		dob,
		pincode,
	}
}
