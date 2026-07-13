import { PageHeader } from "@/components/page-header"
import { UploadWorkspace } from "@/components/upload/upload-workspace"

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Documents"
        description="Contribute research papers, reports, and technical documents to the DESIDOC knowledge base."
      />
      <UploadWorkspace />
    </div>
  )
}
