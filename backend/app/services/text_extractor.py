from io import BytesIO

import fitz
from docx import Document


PDF_TYPE = "application/pdf"
DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


class UnsupportedDocumentError(ValueError):
    pass


def extract_text(data: bytes, content_type: str) -> tuple[str, int, str]:
    if content_type == PDF_TYPE:
        return _extract_pdf(data)
    if content_type == DOCX_TYPE:
        return _extract_docx(data)
    raise UnsupportedDocumentError(f"Unsupported document type: {content_type}")


def _extract_pdf(data: bytes) -> tuple[str, int, str]:
    with fitz.open(stream=data, filetype="pdf") as document:
        pages = [page.get_text("text") for page in document]
        text = "\n\n".join(page.strip() for page in pages if page.strip())
        return text.strip(), len(document), "pymupdf"


def _extract_docx(data: bytes) -> tuple[str, int, str]:
    document = Document(BytesIO(data))
    paragraphs = [paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip()]
    text = "\n".join(paragraphs)
    return text.strip(), 1, "python-docx"
