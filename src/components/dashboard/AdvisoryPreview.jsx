import { advisoriesFor } from '../../services/advisoryService.js'

export default function AdvisoryPreview({ level }) {
  const items = advisoriesFor(level)
  return (
    <div className="border rounded p-4">
      <div className="font-medium">Advisories</div>
      <ul className="list-disc pl-5">
        {items.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
    </div>
  )
}