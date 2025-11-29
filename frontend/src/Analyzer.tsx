"use client"

import { useState } from "react"
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Card,
  CardContent,
  TextField,
  CircularProgress,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import DeleteIcon from "@mui/icons-material/Delete"
import SendIcon from "@mui/icons-material/Send"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ClauseMatch {
  text: string
  positions: [number, number]
  line_number: number
}

interface RecommendationFactor {
  type: string
  description: string
  weight: number
  matches?: number
  examples?: string[]
}

interface SigningRecommendation {
  percentage: number
  recommendation: string
  findings: {
    favorable_factors: RecommendationFactor[]
    risk_factors: RecommendationFactor[]
  }
  missing_clauses: string[]
}

interface AnalysisResult {
  clauses: Record<string, ClauseMatch[]>
  entities: Record<string, string[]>
  summary: string
  statistics: Record<string, number>
  cleaned_text: string
  signing_recommendation: SigningRecommendation
}

export default function Analyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [tab, setTab] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      alert("Analysis failed")
      return
    }

    const data: AnalysisResult = await res.json()
    setResults(data)
    setChatMessages([])
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !results) return

    const userMessage: ChatMessage = { role: "user", content: chatInput }
    setChatMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setIsChatLoading(true)

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: chatInput,
          document_text: results.cleaned_text,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Chat request failed" }))
        throw new Error(errorData.detail || "Chat request failed")
      }

      const data = await res.json()
      const assistantMessage: ChatMessage = { role: "assistant", content: data.answer }
      setChatMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to get response. Make sure Ollama is running with Llama 3.2 model."}`,
      }
      setChatMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "success"
    if (percentage >= 65) return "primary"
    if (percentage >= 50) return "warning"
    return "error"
  }

  const getFullLineWithHighlight = (lineNumber: number, keyword: string, documentText: string) => {
    const lines = documentText.split("\n")
    const lineIndex = lineNumber - 1 // Convert to 0-based index

    if (lineIndex >= 0 && lineIndex < lines.length) {
      let fullLine = lines[lineIndex].trim()

      fullLine = fullLine.replace(/^\*\*\d+\.\s*/, "").replace(/\*\*/g, "")

      // Create a regex that matches the keyword case-insensitively
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")

      // Replace matches with highlighted version
      const highlightedLine = fullLine.replace(regex, (match) => `<HIGHLIGHT>${match}</HIGHLIGHT>`)

      // Split by the highlight markers and render
      const parts = highlightedLine.split(/(<HIGHLIGHT>.*?<\/HIGHLIGHT>)/)

      return parts.map((part, idx) => {
        if (part.startsWith("<HIGHLIGHT>") && part.endsWith("</HIGHLIGHT>")) {
          const text = part.replace(/<\/?HIGHLIGHT>/g, "")
          return (
            <Box
              component="span"
              key={idx}
              sx={{
                color: "#ff4444",
                fontWeight: "bold",
                backgroundColor: "rgba(255, 68, 68, 0.1)",
                padding: "2px 4px",
                borderRadius: "3px",
              }}
            >
              {text}
            </Box>
          )
        }
        return part
      })
    }

    return keyword // Fallback to just the keyword if line not found
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#1a1a1a",
        color: "white",
        display: "flex",
      }}
    >
      <Box
        sx={{
          width: 350,
          bgcolor: "#2d2d2d",
          p: 3,
          borderRight: "1px solid #404040",
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: "white", mb: 3 }}>
          Upload Document
        </Typography>

        <Typography variant="body2" sx={{ color: "#888", mb: 2 }}>
          Choose a file
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
            "&:hover": {
              borderColor: "#666",
            },
          }}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <UploadFileIcon sx={{ fontSize: 48, color: "#666", mb: 1 }} />
          <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
            Drag and drop file here
          </Typography>
          <Typography variant="caption" sx={{ color: "#666" }}>
            Limit 200MB per file • PDF, DOCX, TXT
          </Typography>
          <input
            id="file-input"
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
            "&:hover": {
              borderColor: "#666",
            },
          }}
          onClick={() => document.getElementById("file-input")?.click()}
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

        <Button
          variant="contained"
          fullWidth
          onClick={handleAnalyze}
          disabled={!file}
          sx={{
            bgcolor: "#0066cc",
            "&:hover": {
              bgcolor: "#0052a3",
            },
            "&:disabled": {
              bgcolor: "#333",
            },
          }}
        >
          📊 Analyze Document
        </Button>
      </Box>

      <Box sx={{ flex: 1, p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ color: "white", fontWeight: "bold" }}>
            📄 Legal Document Analyzer
            {/* 📄 Rent Agreement Analyzer */}
          </Typography>
          <Typography variant="body1" sx={{ color: "#888" }}>
            Upload a legal document to analyze its content, extract clauses, and get signing insights.
          </Typography>
        </Box>

        {results && (
          <Paper
            elevation={3}
            sx={{
              bgcolor: "#2d2d2d",
              borderRadius: 3,
              border: "1px solid #404040",
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, newValue) => setTab(newValue)}
              sx={{
                borderBottom: "1px solid #404040",
                "& .MuiTab-root": {
                  color: "#888",
                  "&.Mui-selected": {
                    color: "#ff6b6b",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#ff6b6b",
                },
              }}
            >
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    🔍 Summary
                  </Box>
                }
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    📌 Clauses
                  </Box>
                }
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    🧠 Entities
                  </Box>
                }
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    📊 Statistics
                  </Box>
                }
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    📝 Recommendation
                  </Box>
                }
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    💬 Chatbot
                  </Box>
                }
              />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Summary Tab */}
              {tab === 0 && (
                <Typography variant="body1" sx={{ color: "#ccc", lineHeight: 1.6 }}>
                  {results.summary}
                </Typography>
              )}

              {/* Clauses Tab */}
              {tab === 1 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ color: "white", mb: 3 }}>
                    📌 Detected Clauses
                  </Typography>

                  {Object.entries(results.clauses).map(([clause, matches]) => {
                    const uniqueLineMatches = matches.reduce((acc, match) => {
                      const existing = acc.find((m) => m.line_number === match.line_number)
                      if (!existing) {
                        acc.push(match)
                      }
                      return acc
                    }, [] as ClauseMatch[])

                    const uniqueLineNumbers = Array.from(new Set(matches.map((m) => m.line_number))).sort(
                      (a, b) => a - b,
                    )

                    return (
                      <Box key={clause} sx={{ mb: 3 }}>
                        {matches.length > 0 ? (
                          <>
                            <Typography variant="body1" sx={{ color: "#ccc", mb: 2 }}>
                              <strong>{clause.replace("_", " ")} found on line(s):</strong>{" "}
                              <Box component="span" sx={{ color: "#4fc3f7" }}>
                                {uniqueLineNumbers.join(", ")}
                              </Box>{" "}
                              <Chip
                                label={`${matches.length} match(es)`}
                                size="small"
                                sx={{
                                  bgcolor: "#333",
                                  color: "#ccc",
                                  ml: 1,
                                }}
                              />
                            </Typography>

                            <Accordion
                              sx={{
                                bgcolor: "#1a1a1a",
                                border: "1px solid #404040",
                                "&:before": { display: "none" },
                              }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: "#888" }} />}
                                sx={{
                                  "& .MuiAccordionSummary-content": {
                                    alignItems: "center",
                                  },
                                }}
                              >
                                <Typography sx={{ color: "#ccc" }}>
                                  📋 Show matches for {clause.replace("_", " ")}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails sx={{ pt: 0 }}>
                                {uniqueLineMatches.map((match, i) => (
                                  <Box key={`${match.line_number}-${i}`} sx={{ mb: 2, pl: 2 }}>
                                    <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
                                      • Match {i + 1} (Line {match.line_number}):
                                    </Typography>
                                    <Typography
                                      sx={{
                                        color: "#ccc",
                                        pl: 2,
                                        borderLeft: "2px solid #404040",
                                        lineHeight: 1.6,
                                        fontSize: "0.95rem",
                                      }}
                                    >
                                      {getFullLineWithHighlight(match.line_number, match.text, results.cleaned_text)}
                                    </Typography>
                                  </Box>
                                ))}
                              </AccordionDetails>
                            </Accordion>
                          </>
                        ) : (
                          <Typography sx={{ color: "#888", mb: 2 }}>
                            • <strong>{clause.replace("_", " ")}:</strong> Not found.
                          </Typography>
                        )}
                      </Box>
                    )
                  })}
                </Box>
              )}

              {/* Entities Tab */}
              {tab === 2 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ color: "white", mb: 3 }}>
                    🧠 Extracted Entities
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {Object.entries(results.entities).map(([key, values]) => (
                      <Box key={key} sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "300px" }}>
                        <Card sx={{ bgcolor: "#1a1a1a", border: "1px solid #404040" }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ color: "#4fc3f7", mb: 2 }}>
                              {key.replace("_", " ").toUpperCase()}
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {values.map((value, i) => (
                                <Chip
                                  key={i}
                                  label={value}
                                  size="small"
                                  sx={{
                                    bgcolor: "#333",
                                    color: "#ccc",
                                    "&:hover": {
                                      bgcolor: "#404040",
                                    },
                                  }}
                                />
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Stats Tab */}
              {tab === 3 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ color: "white", mb: 3 }}>
                    📊 Document Statistics
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    {Object.entries(results.statistics).map(([stat, value]) => (
                      <Box key={stat} sx={{ flex: "1 1 calc(33.333% - 12px)", minWidth: "200px" }}>
                        <Card sx={{ bgcolor: "#1a1a1a", border: "1px solid #404040" }}>
                          <CardContent>
                            <Typography variant="h4" sx={{ color: "#4fc3f7", fontWeight: "bold" }}>
                              {value}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#888" }}>
                              {stat.replace("_", " ").toUpperCase()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Recommendation Tab */}
              {tab === 4 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ color: "white", mb: 3 }}>
                    📝 Signing Recommendation
                  </Typography>

                  <Card
                    sx={{
                      bgcolor: "#1a1a1a",
                      border: "2px solid #404040",
                      mb: 3,
                      textAlign: "center",
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Typography
                        variant="h2"
                        sx={{
                          color:
                            getScoreColor(results.signing_recommendation.percentage) === "success"
                              ? "#4caf50"
                              : getScoreColor(results.signing_recommendation.percentage) === "primary"
                                ? "#2196f3"
                                : getScoreColor(results.signing_recommendation.percentage) === "warning"
                                  ? "#ff9800"
                                  : "#f44336",
                          fontWeight: "bold",
                          mb: 2,
                        }}
                      >
                        {results.signing_recommendation.percentage}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={results.signing_recommendation.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          mb: 2,
                          bgcolor: "#333",
                          "& .MuiLinearProgress-bar": {
                            bgcolor:
                              getScoreColor(results.signing_recommendation.percentage) === "success"
                                ? "#4caf50"
                                : getScoreColor(results.signing_recommendation.percentage) === "primary"
                                  ? "#2196f3"
                                  : getScoreColor(results.signing_recommendation.percentage) === "warning"
                                    ? "#ff9800"
                                    : "#f44336",
                          },
                        }}
                      />
                      <Typography variant="h6" sx={{ color: "white" }}>
                        {results.signing_recommendation.recommendation}
                      </Typography>
                    </CardContent>
                  </Card>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {/* Favorable Factors */}
                    <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "400px" }}>
                      <Card sx={{ bgcolor: "#1a1a1a", border: "1px solid #404040", height: "100%" }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: "#4caf50", mb: 2 }}>
                            ✅ Favorable Factors
                          </Typography>
                          {results.signing_recommendation.findings.favorable_factors.length > 0 ? (
                            results.signing_recommendation.findings.favorable_factors.map((f, i) => (
                              <Box
                                key={i}
                                sx={{ mb: 2, p: 2, bgcolor: "#0d2818", borderRadius: 1, border: "1px solid #2e7d32" }}
                              >
                                <Typography sx={{ color: "#ccc" }}>🔹 {f.description}</Typography>
                                <Chip
                                  label={`+${f.weight}`}
                                  size="small"
                                  sx={{
                                    bgcolor: "#4caf50",
                                    color: "white",
                                    mt: 1,
                                  }}
                                />
                              </Box>
                            ))
                          ) : (
                            <Typography sx={{ color: "#888" }}>None found</Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Box>

                    {/* Risk Factors */}
                    <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "400px" }}>
                      <Card sx={{ bgcolor: "#1a1a1a", border: "1px solid #404040", height: "100%" }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: "#f44336", mb: 2 }}>
                            ❌ Risk Factors
                          </Typography>
                          {results.signing_recommendation.findings.risk_factors.length > 0 ? (
                            results.signing_recommendation.findings.risk_factors.map((f, i) => (
                              <Box
                                key={i}
                                sx={{ mb: 2, p: 2, bgcolor: "#2d1b1b", borderRadius: 1, border: "1px solid #d32f2f" }}
                              >
                                <Typography sx={{ color: "#ccc" }}>🔻 {f.description}</Typography>
                                <Chip
                                  label={f.weight}
                                  size="small"
                                  sx={{
                                    bgcolor: "#f44336",
                                    color: "white",
                                    mt: 1,
                                  }}
                                />
                              </Box>
                            ))
                          ) : (
                            <Typography sx={{ color: "#888" }}>None found</Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>

                  {/* Missing Clauses */}
                  {results.signing_recommendation.missing_clauses.length > 0 && (
                    <Card sx={{ bgcolor: "#1a1a1a", border: "1px solid #404040", mt: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: "#ff9800", mb: 2 }}>
                          🚫 Missing Clauses
                        </Typography>
                        {results.signing_recommendation.missing_clauses.map((clause, i) => (
                          <Box
                            key={i}
                            sx={{ mb: 1, p: 2, bgcolor: "#2d2416", borderRadius: 1, border: "1px solid #f57c00" }}
                          >
                            <Typography sx={{ color: "#ccc" }}>❗ {clause.replace("_", " ")}</Typography>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </Box>
              )}

              {tab === 5 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ color: "white", mb: 3 }}>
                    💬 Document Chatbot
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#888", mb: 3 }}>
                    Ask questions about the analyzed document. Powered by Ollama with Llama 3.2.
                  </Typography>

                  {/* Chat Messages */}
                  <Box
                    sx={{
                      height: "500px",
                      overflowY: "auto",
                      mb: 2,
                      p: 2,
                      bgcolor: "#1a1a1a",
                      borderRadius: 2,
                      border: "1px solid #404040",
                    }}
                  >
                    {chatMessages.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 8 }}>
                        <Typography variant="h6" sx={{ color: "#666", mb: 2 }}>
                          💬 Start a conversation
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#888" }}>
                          Ask questions like:
                        </Typography>
                        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
                          <Chip
                            label="What are the key terms of this agreement?"
                            sx={{ bgcolor: "#333", color: "#ccc" }}
                          />
                          <Chip label="What are the termination conditions?" sx={{ bgcolor: "#333", color: "#ccc" }} />
                          <Chip label="Who are the parties involved?" sx={{ bgcolor: "#333", color: "#ccc" }} />
                        </Box>
                      </Box>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <Box
                          key={i}
                          sx={{
                            mb: 2,
                            display: "flex",
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: "75%",
                              p: 2,
                              borderRadius: 2,
                              bgcolor: msg.role === "user" ? "#0066cc" : "#2d2d2d",
                              border: msg.role === "assistant" ? "1px solid #404040" : "none",
                            }}
                          >
                            <Typography variant="caption" sx={{ color: "#888", display: "block", mb: 0.5 }}>
                              {msg.role === "user" ? "You" : "Assistant"}
                            </Typography>
                            <Typography sx={{ color: "#ccc", whiteSpace: "pre-wrap" }}>{msg.content}</Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                    {isChatLoading && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <CircularProgress size={20} sx={{ color: "#0066cc" }} />
                        <Typography sx={{ color: "#888" }}>Thinking...</Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Chat Input */}
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Ask a question about the document..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleChatSubmit()
                        }
                      }}
                      disabled={isChatLoading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "white",
                          bgcolor: "#1a1a1a",
                          "& fieldset": {
                            borderColor: "#404040",
                          },
                          "&:hover fieldset": {
                            borderColor: "#666",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#0066cc",
                          },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleChatSubmit}
                      disabled={!chatInput.trim() || isChatLoading}
                      sx={{
                        bgcolor: "#0066cc",
                        "&:hover": {
                          bgcolor: "#0052a3",
                        },
                        "&:disabled": {
                          bgcolor: "#333",
                        },
                      }}
                    >
                      <SendIcon />
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  )
}
