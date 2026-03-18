import { NextResponse } from 'next/server';
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let text = '';

    if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.name.endsWith('.txt') || file.type === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a .pdf, .docx, or .txt file.' }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('File parsing error:', error);
    return NextResponse.json({ error: 'Error parsing file: ' + error.message }, { status: 500 });
  }
}
