class RerankingService:
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            from sentence_transformers import CrossEncoder
            cls._model = CrossEncoder(
                "cross-encoder/ms-marco-MiniLM-L-6-v2",
            )
        return cls._model

    @staticmethod
    def rerank(query: str, documents: list[str], top_k: int = 10):
        if not documents:
            return [], []

        model = RerankingService.get_model()
        pairs = [(query, doc) for doc in documents]
        scores = model.predict(pairs)

        scored = list(enumerate(scores))
        scored.sort(key=lambda x: x[1], reverse=True)

        top_indices = [idx for idx, _ in scored[:top_k]]
        top_scores = [float(score) for _, score in scored[:top_k]]

        return top_indices, top_scores
