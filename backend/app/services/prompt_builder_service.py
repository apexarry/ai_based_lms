class PromptBuilderService:
    def build_prompt(self, question: str, context: str, intent: str, document=None):
        document_name = document.title if document else "the retrieved document"

        if intent == "overview":
            task = (
                f"Write a concise 5-8 sentence summary of {document_name}. "
                "Cover only points supported by the retrieved context."
            )
        elif intent == "compare":
            task = (
                "Compare only facts that are present in the retrieved context. "
                "If the context does not cover both sides of the comparison, say so."
            )
        elif intent == "recommendation":
            task = (
                "Recommend only documents represented in the retrieved context, "
                "and explain the evidence for each recommendation."
            )
        else:
            task = "Answer the question directly using only the retrieved context."

        return f"""
You are the AI Knowledge Assistant for the DESIDOC Digital Library.

{task}

Never use outside knowledge or infer facts that are not stated in the context.
If the answer is unavailable, reply exactly: "I couldn't find the answer in the uploaded documents."
Every factual paragraph must end with the source label that supports it, such as
[Source: Document title | Page 5 | Section | Chunk 2]. Do not cite unsupported sources.

==================== DOCUMENT CONTEXT ====================
{context}
===================== USER QUESTION ======================
{question}
""".strip()
