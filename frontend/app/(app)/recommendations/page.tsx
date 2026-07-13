import { PageHeader } from "@/components/page-header"
import { RecommendationsView } from "@/components/recommendations/recommendations-view"

export default function RecommendationsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Recommendations</h1>
        <p className="text-muted-foreground">
          AI-powered document recommendations based on your reading history.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[
          {
            title: "Advanced Radar Signal Processing",
            author: "A. Ramachandran",
            reason: "Because you recently read phased-array radar papers.",
          },
          {
            title: "UAV Navigation Systems",
            author: "S. Mehta",
            reason: "Related to your recent AI Assistant queries.",
          },
          {
            title: "Metamaterial Antennas",
            author: "A. Banerjee",
            reason: "Frequently cited alongside your saved documents.",
          },
        ].map((doc, index) => (
          <div
            key={index}
            className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold">{doc.title}</h2>

            <p className="text-sm text-muted-foreground mt-1">
              {doc.author}
            </p>

            <p className="mt-4 text-sm">{doc.reason}</p>

            <button className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Read Document
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}