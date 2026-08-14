export const nativeCompress = async (str: string): Promise<string> => {
	const stream = new Blob([str]).stream()
	const compressedStream = stream.pipeThrough(new CompressionStream('deflate'))

	const buffer = await new Response(compressedStream).arrayBuffer()

	const binStr = String.fromCharCode(...new Uint8Array(buffer))
	const base64 = btoa(binStr)

	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const nativeDecompress = async (base64Url: string): Promise<string> => {
	let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
	while (base64.length % 4) base64 += '='

	const binStr = atob(base64)
	const u8Array = new Uint8Array(binStr.length)
	for (let i = 0; i < binStr.length; i++) {
		u8Array[i] = binStr.charCodeAt(i)
	}

	const decompressedStream = new Blob([u8Array])
		.stream()
		.pipeThrough(new DecompressionStream('deflate'))

	return await new Response(decompressedStream).text()
}
