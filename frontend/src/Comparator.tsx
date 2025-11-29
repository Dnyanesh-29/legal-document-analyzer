import { useState } from "react"
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
} from "@mui/material"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import DeleteIcon from "@mui/icons-material/Delete"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import CompareArrowsIcon from "@mui/icons-material/CompareArrows"
import WarningIcon from "@mui/icons-material/Warning"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import InfoIcon from "@mui/icons-material/Info"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import TrendingDownIcon from "@mui/icons-material/TrendingDown"

interface ComparisonResult {
  doc1_path: string
  doc2_path: string
  clause_differences: Record<string, {
    status: string
    similarity: number
    doc1: { count: number; texts: string[]; line_numbers: number[] }
    doc2: { count: number; texts: string[]; line_numbers: number[] }
    analysis: string
  }>
  entity_differences: Record<string, {
    similarity: number
    common: string[]
    only_in_doc1: string[]
    only_in_doc2: string[]
    doc1_count: number
    doc2_count: number
    significance: string
  }>
  summary_comparison: {
    doc1_summary: string
    doc2_summary: string
    similarity: number
    key_differences: string[]
  }
  recommendation_comparison: {
    doc1: {
      score: number
      recommendation: string
      risk_factors: any[]
      favorable_factors: any[]
    }
    doc2: {
      score: number
      recommendation: string
      risk_factors: any[]
      favorable_factors: any[]
    }
    score_difference: number
    which_is_better: {
      better_document: string
      reason: string
      recommendation: string
    }
  }
  statistics_comparison: {
    doc1: { word_count: number; char_count: number; paragraph_count: number }
    doc2: { word_count: number; char_count: number; paragraph_count: number }
    differences: {
      word_count_diff: number
      char_count_diff: number
      paragraph_count_diff: number
    }
  }
  critical_differences: Array<{
    type: string
    severity: string
    details: string
    clause?: string
  }>
  overall_similarity: {
    percentage: number
    interpretation: string
    clause_similarity: number
    entity_similarity: number
    summary_similarity: number
  }
}

export default function Comparator() {
  const [file1, setFile1] = useState<File | null>(null)
  const [file2, setFile2] = useState<File | null>(null)
  const [results, setResults] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = async () => {
    if (!file1 || !file2) {
      alert("Please select both documents before comparing")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("file1", file1)
    formData.append("file2", file2)

    try {
      const res = await fetch("http://localhost:8000/compare", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        let errorMessage = "Comparison failed"
        try {
          const errorText = await res.text()
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.detail || errorData.message || errorText
          } catch {
            errorMessage = errorText || `Server error: ${res.status} ${res.statusText}`
          }
        } catch (e) {
          errorMessage = `Server error: ${res.status} ${res.statusText}`
        }
        alert(`Comparison failed:\n\n${errorMessage}`)
        return
      }

      const data: ComparisonResult = await res.json()
      setResults(data)
    } catch (error) {
      console.error("Comparison error:", error)
      alert(`Error comparing documents: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "#4caf50"
    if (percentage >= 65) return "#2196f3"
    if (percentage >= 50) return "#ff9800"
    return "#f44336"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH": return "#f44336"
      case "MEDIUM": return "#ff9800"
      case "LOW": return "#2196f3"
      default: return "#666"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present_in_both": return "#4caf50"
      case "only_in_doc1": return "#ff9800"
      case "only_in_doc2": return "#2196f3"
      default: return "#666"
    }
  }

  const FileUploadCard = ({
    file,
    setFile,
    label,
  }: {
    file: File | null
    setFile: (file: File | null) => void
    label: string
  }) => (
    <Box sx={{ flex: 1 }}>
      <Typography variant="body2" sx={{ color: "#888", mb: 2 }}>
        {label}
      </Typography>

      <Paper
        sx={{
          p: 3,
          bgcolor: "#1a1a1a",
          border: "2px dashed #404040",
          borderRadius: 2,
          textAlign: "center",
          mb: 2,
          cursor: "pointer",
          "&:hover": { borderColor: "#666" },
        }}
        onClick={() => document.getElementById(`file-input-${label}`)?.click()}
      >
        <UploadFileIcon sx={{ fontSize: 48, color: "#666", mb: 1 }} />
        <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
          Drag and drop file here
        </Typography>
        <Typography variant="caption" sx={{ color: "#666" }}>
          PDF, DOCX, TXT
        </Typography>
        <input
          id={`file-input-${label}`}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ display: "none" }}
          accept=".pdf,.docx,.txt"
        />
      </Paper>

      <Button
        variant="outlined"
        sx={{
          width: "100%",
          mb: 2,
          color: "white",
          borderColor: "#404040",
          "&:hover": { borderColor: "#666" },
        }}
        onClick={() => document.getElementById(`file-input-${label}`)?.click()}
      >
        Browse files
      </Button>

      {file && (
        <Card sx={{ bgcolor: "#333", mb: 2 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ color: "white" }}>
                  {file.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "#888" }}>
                  {(file.size / 1024).toFixed(1)}KB
                </Typography>
              </Box>
              <Button size="small" onClick={() => setFile(null)} sx={{ color: "#888", minWidth: "auto", p: 0.5 }}>
                <DeleteIcon fontSize="small" />
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0a", color: "white", p: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ color: "white", fontWeight: "bold" }}>
          <CompareArrowsIcon sx={{ fontSize: 48, verticalAlign: "middle", mr: 2 }} />
          Document Comparison
        </Typography>
        <Typography variant="body1" sx={{ color: "#888" }}>
          Advanced legal document comparison with AI-powered analysis
        </Typography>
      </Box>

      <Paper sx={{ bgcolor: "#1a1a1a", borderRadius: 3, border: "1px solid #333", p: 4, mb: 4 }}>
        <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
          <FileUploadCard file={file1} setFile={setFile1} label="Document 1" />
          <FileUploadCard file={file2} setFile={setFile2} label="Document 2" />
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleCompare}
          disabled={!file1 || !file2 || loading}
          sx={{
            bgcolor: "#0066cc",
            py: 1.5,
            fontSize: "1.1rem",
            "&:hover": { bgcolor: "#0052a3" },
            "&:disabled": { bgcolor: "#333" },
          }}
        >
          {loading ? "Comparing..." : "🔍 Compare Documents"}
        </Button>
      </Paper>

      {results && (
        <Box>
          {/* Overall Similarity */}
          <Paper sx={{ bgcolor: "#1a1a1a", borderRadius: 3, border: "1px solid #333", p: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: "white", mb: 3 }}>
              📊 Overall Similarity Analysis
            </Typography>
            
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography variant="h1" sx={{ color: getScoreColor(results.overall_similarity.percentage), fontWeight: "bold", mb: 1 }}>
                {results.overall_similarity.percentage}%
              </Typography>
              <Typography variant="h6" sx={{ color: "#ccc", mb: 3 }}>
                {results.overall_similarity.interpretation}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Card sx={{ bgcolor: "#0d1117", border: "1px solid #333", textAlign: "center", p: 2 }}>
                  <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>Clause Similarity</Typography>
                  <Typography variant="h4" sx={{ color: "#4caf50" }}>{results.overall_similarity.clause_similarity}%</Typography>
                </Card>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Card sx={{ bgcolor: "#0d1117", border: "1px solid #333", textAlign: "center", p: 2 }}>
                  <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>Entity Similarity</Typography>
                  <Typography variant="h4" sx={{ color: "#2196f3" }}>{results.overall_similarity.entity_similarity}%</Typography>
                </Card>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Card sx={{ bgcolor: "#0d1117", border: "1px solid #333", textAlign: "center", p: 2 }}>
                  <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>Summary Similarity</Typography>
                  <Typography variant="h4" sx={{ color: "#ff9800" }}>{results.overall_similarity.summary_similarity}%</Typography>
                </Card>
              </Box>
            </Box>
          </Paper>

          {/* Critical Differences */}
          {results.critical_differences && results.critical_differences.length > 0 && (
            <Paper sx={{ bgcolor: "#1a1a1a", borderRadius: 3, border: "2px solid #f44336", p: 4, mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <WarningIcon sx={{ fontSize: 32, color: "#f44336", mr: 2 }} />
                <Typography variant="h5" sx={{ color: "white" }}>
                  Critical Differences Detected
                </Typography>
              </Box>

              {results.critical_differences.map((diff, idx) => (
                <Alert
                  key={idx}
                  severity={diff.severity === "HIGH" ? "error" : diff.severity === "MEDIUM" ? "warning" : "info"}
                  sx={{ mb: 2, bgcolor: "#0d1117", color: "white" }}
                  icon={<WarningIcon sx={{ color: getSeverityColor(diff.severity) }} />}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                    {diff.type.replace(/_/g, " ").toUpperCase()} - {diff.severity} SEVERITY
                  </Typography>
                  <Typography variant="body2">{diff.details}</Typography>
                  {diff.clause && <Typography variant="caption" sx={{ color: "#888" }}>Clause: {diff.clause}</Typography>}
                </Alert>
              ))}
            </Paper>
          )}

          {/* Which Document is Better */}
          <Paper sx={{ bgcolor: "#1a1a1a", borderRadius: 3, border: "1px solid #333", p: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: "white", mb: 3 }}>
              🏆 Recommendation
            </Typography>

            <Card sx={{ bgcolor: "#0d1117", border: "2px solid #0066cc", p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 32, color: "#4caf50", mr: 2 }} />
                <Typography variant="h6" sx={{ color: "white" }}>
                  {results.recommendation_comparison.which_is_better.better_document}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: "#ccc", mb: 2 }}>
                {results.recommendation_comparison.which_is_better.reason}
              </Typography>
              <Alert severity="info" sx={{ bgcolor: "#0d2818" }}>
                <Typography variant="body2">
                  💡 {results.recommendation_comparison.which_is_better.recommendation}
                </Typography>
              </Alert>
            </Card>
          </Paper>

          {/* Risk Score Comparison */}
          <Paper sx={{ bgcolor: "#1a1a1a", borderRadius: 3, border: "1px solid #333", p: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: "white", mb: 3 }}>
              📝 Signing Recommendation Comparison
            </Typography>

            <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
              {/* Document 1 Score */}
              <Card sx={{ flex: 1, bgcolor: "#0d1117", border: "2px solid #333", textAlign: "center" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ color: "#888", mb: 2 }}>Document 1</Typography>
                  <Typography variant="h2" sx={{ color: getScoreColor(results.recommendation_comparison.doc1.score), fontWeight: "bold", mb: 2 }}>
                    {results.recommendation_comparison.doc1.score}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={results.recommendation_comparison.doc1.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 2,
                      bgcolor: "#1a1a1a",
                      "& .MuiLinearProgress-bar": { bgcolor: getScoreColor(results.recommendation_comparison.doc1.score) },
                    }}
                  />
                  <Typography variant="body1" sx={{ color: "white", mb: 2 }}>
                    {results.recommendation_comparison.doc1.recommendation}
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: "#333" }} />
                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="body2" sx={{ color: "#f44336", mb: 1 }}>
                      ⚠️ {results.recommendation_comparison.doc1.risk_factors.length} Risk Factor(s)
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#4caf50" }}>
                      ✓ {results.recommendation_comparison.doc1.favorable_factors.length} Favorable Factor(s)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Score Difference Indicator */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minWidth: 80 }}>
                {results.recommendation_comparison.score_difference > 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 48, color: "#4caf50" }} />
                ) : results.recommendation_comparison.score_difference < 0 ? (
                  <TrendingDownIcon sx={{ fontSize: 48, color: "#f44336" }} />
                ) : (
                  <InfoIcon sx={{ fontSize: 48, color: "#888" }} />
                )}
                <Typography variant="h6" sx={{ color: "#ccc", mt: 1 }}>
                  {Math.abs(results.recommendation_comparison.score_difference).toFixed(1)}
                </Typography>
                <Typography variant="caption" sx={{ color: "#888" }}>points</Typography>
              </Box>

              {/* Document 2 Score */}
              <Card sx={{ flex: 1, bgcolor: "#0d1117", border: "2px solid #333", textAlign: "center" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ color: "#888", mb: 2 }}>Document 2</Typography>
                  <Typography variant="h2" sx={{ color: getScoreColor(results.recommendation_comparison.doc2.score), fontWeight: "bold", mb: 2 }}>
                    {results.recommendation_comparison.doc2.score}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={results.recommendation_comparison.doc2.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 2,
                      bgcolor: "#1a1a1a",
                      "& .MuiLinearProgress-bar": { bgcolor: getScoreColor(results.recommendation_comparison.doc2.score) },
                    }}
                  />
                  <Typography variant="body1" sx={{ color: "white", mb: 2 }}>
                    {results.recommendation_comparison.doc2.recommendation}
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: "#333" }} />
                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="body2" sx={{ color: "#f44336", mb: 1 }}>
                      ⚠️ {results.recommendation_comparison.doc2.risk_factors.length} Risk Factor(s)
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#4caf50" }}>
                      ✓ {results.recommendation_comparison.doc2.favorable_factors.length} Favorable Factor(s)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Paper>

          {/* Statistics Comparison */}
          <Paper sx={{ bgcolor: "#1a1a1a", borderRadius: 3, border: "1px solid #333", p: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: "white", mb: 3 }}>
              📈 Document Statistics
            </Typography>

            <Box sx={{ display: "flex", gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Card sx={{ bgcolor: "#0d1117", border: "1px solid #333", p: 2 }}>
                  <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>Word Count</Typography>
                  <Typography variant="h6" sx={{ color: "#ccc" }}>
                    Doc 1: {results.statistics_comparison.doc1.word_count}
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#ccc" }}>
                    Doc 2: {results.statistics_comparison.doc2.word_count}
                  </Typography>
                  <Typography variant="caption" sx={{ color: results.statistics_comparison.differences.word_count_diff >= 0 ? "#4caf50" : "#f44336" }}>
                    Difference: {results.statistics_comparison.differences.word_count_diff >= 0 ? "+" : ""}{results.statistics_comparison.differences.word_count_diff}
                  </Typography>
                </Card>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Card sx={{ bgcolor: "#0d1117", border: "1px solid #333", p: 2 }}>
                  <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>Character Count</Typography>
                  <Typography variant="h6" sx={{ color: "#ccc" }}>
                    Doc 1: {results.statistics_comparison.doc1.char_count}
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#ccc" }}>
                    Doc 2: {results.statistics_comparison.doc2.char_count}
                  </Typography>
                  <Typography variant="caption" sx={{ color: results.statistics_comparison.differences.char_count_diff >= 0 ? "#4caf50" : "#f44336" }}>
                    Difference: {results.statistics_comparison.differences.char_count_diff >= 0 ? "+" : ""}{results.statistics_comparison.differences.char_count_diff}
                  </Typography>
                </Card>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Card sx={{ bgcolor: "#0d1117", border: "1px solid #333", p: 2 }}>
                  <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>Paragraphs</Typography>
                  <Typography variant="h6" sx={{ color: "#ccc" }}>
                    Doc 1: {results.statistics_comparison.doc1.paragraph_count}
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#ccc" }}>
                    Doc 2: {results.statistics_comparison.doc2.paragraph_count}
                  </Typography>
                  <Typography variant="caption" sx={{ color: results.statistics_comparison.differences.paragraph_count_diff >= 0 ? "#4caf50" : "#f44336" }}>
                    Difference: {results.statistics_comparison.differences.paragraph_count_diff >= 0 ? "+" : ""}{results.statistics_comparison.differences.paragraph_count_diff}
                  </Typography>
                </Card>
              </Box>
            </Box>
          </Paper>

          {/* Clause Differences */}
          <Paper sx={{ bgcolor: "#1a1a1a", borderRadius: 3, border: "1px solid #333", p: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: "white", mb: 3 }}>
              📌 Clause Differences
            </Typography>

            {Object.entries(results.clause_differences).map(([clauseName, clauseData]) => (
              <Accordion
                key={clauseName}
                sx={{
                  bgcolor: "#0d1117",
                  border: `1px solid ${getStatusColor(clauseData.status)}`,
                  mb: 2,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#888" }} />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                    <Typography sx={{ color: "#ccc", flex: 1 }}>
                      {clauseName.replace(/_/g, " ").toUpperCase()}
                    </Typography>
                    <Chip
                      label={`${clauseData.similarity}% similar`}
                      size="small"
                      sx={{ bgcolor: getScoreColor(clauseData.similarity), color: "white", mr: 1 }}
                    />
                    <Chip
                      label={clauseData.status.replace(/_/g, " ")}
                      size="small"
                      sx={{ bgcolor: getStatusColor(clauseData.status), color: "white" }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ color: "#ff9800", mb: 2, fontStyle: "italic" }}>
                    {clauseData.analysis}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
                        Document 1: ({clauseData.doc1.count} occurrence{clauseData.doc1.count !== 1 ? "s" : ""})
                      </Typography>
                      {clauseData.doc1.texts.length > 0 ? (
                        clauseData.doc1.texts.map((clause, i) => (
                          <Box key={i} sx={{ mb: 1 }}>
                            <Typography sx={{ color: "#ccc", p: 1, bgcolor: "#0d2818", borderRadius: 1, fontSize: "0.9rem" }}>
                              • {clause}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#666", ml: 1 }}>
                              Line {clauseData.doc1.line_numbers[i]}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography sx={{ color: "#666", fontStyle: "italic" }}>Not found</Typography>
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
                        Document 2: ({clauseData.doc2.count} occurrence{clauseData.doc2.count !== 1 ? "s" : ""})
                      </Typography>
                      {clauseData.doc2.texts.length > 0 ? (
                        clauseData.doc2.texts.map((clause, i) => (
                          <Box key={i} sx={{ mb: 1 }}>
                            <Typography sx={{ color: "#ccc", p: 1, bgcolor: "#0d2818", borderRadius: 1, fontSize: "0.9rem" }}>
                              • {clause}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#666", ml: 1 }}>
                              Line {clauseData.doc2.line_numbers[i]}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography sx={{ color: "#666", fontStyle: "italic" }}>Not found</Typography>
                      )}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>

          {/* Entity Differences */}
          <Paper sx={{ bgcolor: "#1a1a1a", borderRadius: 3, border: "1px solid #333", p: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: "white", mb: 3 }}>
              🧠 Entity Differences
            </Typography>

            {Object.entries(results.entity_differences).map(([entityName, entityData]) => (
              <Accordion
                key={entityName}
                sx={{
                  bgcolor: "#0d1117",
                  border: `1px solid ${getScoreColor(entityData.similarity)}`,
                  mb: 2,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#888" }} />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                    <Typography sx={{ color: "#ccc", flex: 1 }}>
                      {entityName.replace(/_/g, " ")}
                    </Typography>
                    <Chip
                      label={`${entityData.similarity}% similar`}
                      size="small"
                      sx={{ bgcolor: getScoreColor(entityData.similarity), color: "white", mr: 1 }}
                    />
                    <Chip
                      label={entityData.significance}
                      size="small"
                      sx={{ bgcolor: getSeverityColor(entityData.significance.split(" ")[0]), color: "white" }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {entityData.common.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: "#4caf50", mb: 1 }}>
                        ✓ Common in Both ({entityData.common.length}):
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {entityData.common.map((entity, i) => (
                          <Chip key={i} label={entity} size="small" sx={{ bgcolor: "#0d2818", color: "#4caf50" }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
                        Only in Document 1 ({entityData.only_in_doc1.length}):
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {entityData.only_in_doc1.length > 0 ? (
                          entityData.only_in_doc1.map((entity, i) => (
                            <Chip key={i} label={entity} size="small" sx={{ bgcolor: "#2d1a0d", color: "#ff9800" }} />
                          ))
                        ) : (
                          <Typography sx={{ color: "#666", fontStyle: "italic" }}>None</Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
                        Only in Document 2 ({entityData.only_in_doc2.length}):
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {entityData.only_in_doc2.length > 0 ? (
                          entityData.only_in_doc2.map((entity, i) => (
                            <Chip key={i} label={entity} size="small" sx={{ bgcolor: "#0d1a2d", color: "#2196f3" }} />
                          ))
                        ) : (
                          <Typography sx={{ color: "#666", fontStyle: "italic" }}>None</Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>

          {/* Summary Comparison */}
          <Paper sx={{ bgcolor: "#1a1a1a", borderRadius: 3, border: "1px solid #333", p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: "white", mb: 3 }}>
              📄 Summary Comparison
            </Typography>

            <Card sx={{ bgcolor: "#0d1117", border: "1px solid #333", p: 3, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "#888", mb: 1 }}>
                Similarity Score: {results.summary_comparison.similarity}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={results.summary_comparison.similarity}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "#1a1a1a",
                  "& .MuiLinearProgress-bar": { bgcolor: getScoreColor(results.summary_comparison.similarity) },
                }}
              />
            </Card>

            {results.summary_comparison.key_differences.length > 0 && (
              <Alert severity="info" sx={{ bgcolor: "#0d1117", color: "#ccc", mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                  Key Differences:
                </Typography>
                {results.summary_comparison.key_differences.map((diff, idx) => (
                  <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                    • {diff}
                  </Typography>
                ))}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Card sx={{ bgcolor: "#0d1117", border: "1px solid #333", p: 3, height: "100%" }}>
                  <Typography variant="subtitle1" sx={{ color: "#888", mb: 2, fontWeight: "bold" }}>
                    Document 1 Summary
                  </Typography>
                  <Typography sx={{ color: "#ccc", lineHeight: 1.8 }}>
                    {results.summary_comparison.doc1_summary}
                  </Typography>
                </Card>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Card sx={{ bgcolor: "#0d1117", border: "1px solid #333", p: 3, height: "100%" }}>
                  <Typography variant="subtitle1" sx={{ color: "#888", mb: 2, fontWeight: "bold" }}>
                    Document 2 Summary
                  </Typography>
                  <Typography sx={{ color: "#ccc", lineHeight: 1.8 }}>
                    {results.summary_comparison.doc2_summary}
                  </Typography>
                </Card>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  )
}