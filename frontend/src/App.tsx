"use client"

import { useState } from "react"
import { ThemeProvider, createTheme, Box, Button } from "@mui/material"
import CssBaseline from "@mui/material/CssBaseline"
import Analyzer from "./Analyzer"
import Comparator from "./Comparator"
import ContractGenerator from "./ContractGenerator"

const theme = createTheme({
  palette: {
    primary: {
      main: "#2196F3",
      light: "#64B5F6",
      dark: "#1976D2",
    },
    secondary: {
      main: "#9C27B0",
      light: "#BA68C8",
      dark: "#7B1FA2",
    },
    success: { main: "#4CAF50" },
    warning: { main: "#FF9800" },
    error: { main: "#F44336" },
    background: { default: "#f5f7fa" },
  },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
      },
    },
  },
})

function App() {
  const [view, setView] = useState<"analyze" | "compare" | "generate">("analyze")

  const getButtonStyle = (current: string) => ({
    color: view === current ? "white" : "#888",
    bgcolor: view === current ? "#0066cc" : "transparent",
    borderColor: "#404040",
    "&:hover": {
      bgcolor: view === current ? "#0052a3" : "#333",
      borderColor: "#666",
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Box
          sx={{
            bgcolor: "#2d2d2d",
            borderBottom: "1px solid #404040",
            p: 2,
            display: "flex",
            gap: 2,
            justifyContent: "center",
          }}
        >
          <Button
            variant={view === "analyze" ? "contained" : "outlined"}
            onClick={() => setView("analyze")}
            sx={getButtonStyle("analyze")}
          >
            📊 Analyze Document
          </Button>

          <Button
            variant={view === "compare" ? "contained" : "outlined"}
            onClick={() => setView("compare")}
            sx={getButtonStyle("compare")}
          >
            🔍 Compare Documents
          </Button>

          <Button
            variant={view === "generate" ? "contained" : "outlined"}
            onClick={() => setView("generate")}
            sx={getButtonStyle("generate")}
          >
            🧾 Generate Documents
          </Button>
        </Box>

        {view === "analyze" && <Analyzer />}
        {view === "compare" && <Comparator />}
        {view === "generate" && <ContractGenerator />}
      </div>
    </ThemeProvider>
  )
}

export default App
