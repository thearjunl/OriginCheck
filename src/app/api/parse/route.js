import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function parseDOCX(buffer) {
  const mammoth = await import('mammoth');
  const result = await mammoth.default.extractRawText({ buffer });
  return result.value;
}

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
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    if (fileName.endsWith('.pdf') || fileType === 'application/pdf') {
      return NextResponse.json({ 
        needsClientParsing: true, 
        fileData: arrayBuffer ? Buffer.from(arrayBuffer).toString('base64') : '',
        message: 'PDF parsing will be done client-side' 
      });
    } else if (fileName.endsWith('.docx') || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await parseDOCX(buffer);
    } else if (fileName.endsWith('.txt') || fileType === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a .pdf, .docx, or .txt file.' }, { status: 400 });
    }

    return NextResponse.json({ text, needsClientParsing: false });
  } catch (error) {
    console.error('File parsing error:', error);
    return NextResponse.json({ error: 'Error parsing file: ' + error.message }, { status: 500 });
  }
}
