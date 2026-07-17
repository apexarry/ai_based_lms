from rapidfuzz import fuzz
from sqlalchemy.orm import Session

from app.models.document import Document


class QueryService:

    def __init__(self):
        pass

    def detect_document(
        self,
        question: str,
        db: Session,
        threshold: int = 92,
    ):

        question = question.lower().strip()

        documents = db.query(Document).all()

        if not documents:
            return None

        best_document = None
        best_score = 0

        print("\n" + "=" * 80)
        print("DOCUMENT DETECTION")
        print("=" * 80)

        for document in documents:

            title = document.title.lower().strip()
            if title and title in question:
                return document

            score = max(
                fuzz.token_set_ratio(
                    question,
                    title,
                ),
                fuzz.token_sort_ratio(
                    question,
                    title,
                ),
            )

            print(f"{document.title:<35} Score: {score}")

            if score > best_score:
                best_score = score
                best_document = document

        print("-" * 80)
        print(f"Best Match : {best_document.title if best_document else 'None'}")
        print(f"Score      : {best_score}")
        print("=" * 80)

        if best_document and best_score >= threshold:
            return best_document

        return None

    def detect_intent(
        self,
        question: str,
    ):

        question = question.lower()

        overview_keywords = [
            "summary",
            "summarize",
            "overview",
            "abstract",
            "gist",
        ]

        compare_keywords = [
            "compare",
            "difference",
            "versus",
            "vs",
        ]

        recommendation_keywords = [
            "recommend",
            "similar",
            "related",
            "suggest",
        ]

        list_keywords = [
            "list",
            "show all",
            "display",
            "find papers",
            "find documents",
        ]

        if any(keyword in question for keyword in overview_keywords):
            return "overview"

        if any(keyword in question for keyword in compare_keywords):
            return "compare"

        if any(keyword in question for keyword in recommendation_keywords):
            return "recommendation"

        if any(keyword in question for keyword in list_keywords):
            return "list"

        return "question"

    def understand_query(
        self,
        question: str,
        db: Session,
    ):

        intent = self.detect_intent(question)

        document = self.detect_document(
            question,
            db,
        )

        retrieval_strategy = {
            "overview": "intro_first",
            "question": "semantic",
            "compare": "compare",
            "recommendation": "recommendation",
            "list": "metadata_search",
        }.get(intent, "semantic")

        print("\n" + "=" * 80)
        print("QUERY UNDERSTANDING")
        print("=" * 80)
        print(f"Intent              : {intent}")
        print(f"Retrieval Strategy  : {retrieval_strategy}")
        print(
            f"Detected Document   : {document.title if document else 'None'}"
        )
        print("=" * 80)

        return {
            "intent": intent,
            "document": document,
            "retrieval_strategy": retrieval_strategy,
        }
