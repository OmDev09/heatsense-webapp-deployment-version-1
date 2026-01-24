export default function RiskAssessment({ risk }) {
  return (
    <div className="border rounded p-4">
      <div className="font-medium">Risk</div>
      <div>{risk.level}</div>
    </div>
  )
}