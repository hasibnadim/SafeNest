'use server'
import { Binary } from 'mongodb'
import sharp from 'sharp'

export async function compressImage(base64Image: string, maxSide = 1200): Promise<Buffer> {
    const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) throw new Error('Invalid base64')
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, 'base64')
    const resized = await sharp(buffer).resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer()
    return resized
}


export async function binaryToBuffer(bin: Binary) {
    const u8 = bin.buffer instanceof ArrayBuffer ? new Uint8Array(bin.buffer) : bin.buffer
    return Buffer.from(u8)
}