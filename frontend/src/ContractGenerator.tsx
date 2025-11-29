// import { useState } from "react"
// import {
//   Box,
//   Typography,
//   Paper,
//   Button,
//   TextField,
//   Card,
//   CardContent,
//   Alert,
//   Stepper,
//   Step,
//   StepLabel,
//   Chip,
//   Divider,
//   Tabs,
//   Tab,
// } from "@mui/material"
// import DescriptionIcon from "@mui/icons-material/Description"
// import DownloadIcon from "@mui/icons-material/Download"
// import ArrowBackIcon from "@mui/icons-material/ArrowBack"
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
// import CheckCircleIcon from "@mui/icons-material/CheckCircle"
// import UploadFileIcon from "@mui/icons-material/UploadFile"
// import DeleteIcon from "@mui/icons-material/Delete"

// interface TemplateInfo {
//   name: string
//   description: string
//   fields: string[]
// }

// const CONTRACT_TEMPLATES: Record<string, TemplateInfo> = {
//   nda: {
//     name: "Non-Disclosure Agreement (NDA)",
//     description: "Protects confidential information between parties",
//     fields: [
//       "disclosing_party_name",
//       "disclosing_party_address",
//       "disclosing_party_email",
//       "disclosing_party_title",
//       "receiving_party_name",
//       "receiving_party_address",
//       "receiving_party_email",
//       "receiving_party_title",
//       "business_purpose",
//       "purpose_of_disclosure",
//       "term_years",
//       "notice_period",
//       "survival_years",
//       "governing_state",
//     ],
//   },
//   service_agreement: {
//     name: "Service Agreement",
//     description: "Defines terms for professional services between provider and client",
//     fields: [
//       "provider_name",
//       "provider_address",
//       "provider_email",
//       "provider_phone",
//       "provider_title",
//       "client_name",
//       "client_address",
//       "client_email",
//       "client_phone",
//       "client_title",
//       "service_type",
//       "service_description",
//       "start_date",
//       "end_date",
//       "renewal_period",
//       "renewal_notice_days",
//       "payment_structure",
//       "total_amount",
//       "payment_schedule",
//       "invoice_frequency",
//       "payment_terms",
//       "late_fee_rate",
//       "deliverables",
//       "delivery_date",
//       "ip_ownership_clause",
//       "confidentiality_period",
//       "liability_cap",
//       "termination_notice",
//       "cure_period",
//       "dispute_resolution_method",
//       "governing_state",
//     ],
//   },
// }

// const FIELD_LABELS: Record<string, string> = {
//   disclosing_party_name: "Disclosing Party Name",
//   disclosing_party_address: "Disclosing Party Address",
//   disclosing_party_email: "Disclosing Party Email",
//   disclosing_party_title: "Disclosing Party Title",
//   receiving_party_name: "Receiving Party Name",
//   receiving_party_address: "Receiving Party Address",
//   receiving_party_email: "Receiving Party Email",
//   receiving_party_title: "Receiving Party Title",
//   business_purpose: "Business Purpose",
//   purpose_of_disclosure: "Purpose of Disclosure",
//   term_years: "Term (Years)",
//   notice_period: "Notice Period (Days)",
//   survival_years: "Survival Period (Years)",
//   governing_state: "Governing State/Jurisdiction",
//   provider_name: "Service Provider Name",
//   provider_address: "Service Provider Address",
//   provider_email: "Service Provider Email",
//   provider_phone: "Service Provider Phone",
//   provider_title: "Service Provider Title",
//   client_name: "Client Name",
//   client_address: "Client Address",
//   client_email: "Client Email",
//   client_phone: "Client Phone",
//   client_title: "Client Title",
//   service_type: "Service Type",
//   service_description: "Service Description",
//   start_date: "Start Date",
//   end_date: "End Date",
//   renewal_period: "Renewal Period",
//   renewal_notice_days: "Renewal Notice (Days)",
//   payment_structure: "Payment Structure",
//   total_amount: "Total Amount",
//   payment_schedule: "Payment Schedule",
//   invoice_frequency: "Invoice Frequency",
//   payment_terms: "Payment Terms (Days)",
//   late_fee_rate: "Late Fee Rate (%)",
//   deliverables: "Deliverables",
//   delivery_date: "Delivery Date",
//   ip_ownership_clause: "IP Ownership Clause",
//   confidentiality_period: "Confidentiality Period (Years)",
//   liability_cap: "Liability Cap",
//   termination_notice: "Termination Notice (Days)",
//   cure_period: "Cure Period (Days)",
//   dispute_resolution_method: "Dispute Resolution Method",
// }

// export default function ContractGenerator() {
//   const [mode, setMode] = useState<"builtin" | "custom">("builtin")
//   const [activeStep, setActiveStep] = useState(0)
//   const [selectedTemplate, setSelectedTemplate] = useState<string>("")
//   const [formData, setFormData] = useState<Record<string, string>>({})
//   const [loading, setLoading] = useState(false)
//   const [generatedFile, setGeneratedFile] = useState<string | null>(null)
//   const [error, setError] = useState<string | null>(null)
  
//   // Custom template states
//   const [customTemplateFile, setCustomTemplateFile] = useState<File | null>(null)
//   const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([
//     { key: "", value: "" }
//   ])

//   const steps = mode === "builtin" 
//     ? ["Select Template", "Fill Details", "Generate Contract"]
//     : ["Upload Template", "Fill Placeholders", "Generate Contract"]

//   const handleTemplateSelect = (templateType: string) => {
//     setSelectedTemplate(templateType)
//     setFormData({})
//     setError(null)
//     setGeneratedFile(null)
//   }

//   const handleInputChange = (field: string, value: string) => {
//     setFormData({ ...formData, [field]: value })
//   }

//   const handleNext = () => {
//     if (activeStep === 0) {
//       if (mode === "builtin" && !selectedTemplate) {
//         setError("Please select a contract template")
//         return
//       }
//       if (mode === "custom" && !customTemplateFile) {
//         setError("Please upload a template file")
//         return
//       }
//     }
//     setError(null)
//     setActiveStep((prev) => prev + 1)
//   }

//   const handleBack = () => {
//     setError(null)
//     setActiveStep((prev) => prev - 1)
//   }

//   const handleModeChange = (_: any, newValue: number) => {
//     setMode(newValue === 0 ? "builtin" : "custom")
//     setActiveStep(0)
//     setSelectedTemplate("")
//     setFormData({})
//     setCustomTemplateFile(null)
//     setCustomFields([{ key: "", value: "" }])
//     setError(null)
//     setGeneratedFile(null)
//   }

//   const handleGenerateBuiltinContract = async () => {
//     setLoading(true)
//     setError(null)

//     try {
//       const response = await fetch("http://localhost:8000/generate-contract", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           contract_type: selectedTemplate,
//           user_data: formData,
//           format_type: "docx",
//         }),
//       })

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}))
//         throw new Error(errorData.detail || "Failed to generate contract")
//       }

//       const blob = await response.blob()
//       const url = window.URL.createObjectURL(blob)
//       const a = document.createElement("a")
//       a.href = url
//       a.download = `${selectedTemplate}_${Date.now()}.docx`
//       document.body.appendChild(a)
//       a.click()
//       document.body.removeChild(a)
//       window.URL.revokeObjectURL(url)

//       setGeneratedFile(a.download)
//       setActiveStep(2)
//     } catch (err) {
//       console.error("Contract generation error:", err)
//       setError(err instanceof Error ? err.message : "Failed to generate contract")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleGenerateCustomContract = async () => {
//     if (!customTemplateFile) {
//       setError("Please upload a template file")
//       return
//     }

//     setLoading(true)
//     setError(null)

//     try {
//       const formDataObj = new FormData()
//       formDataObj.append("template_file", customTemplateFile)
      
//       const fieldsObj: Record<string, string> = {}
//       customFields.forEach(field => {
//         if (field.key && field.value) {
//           fieldsObj[field.key] = field.value
//         }
//       })
//       formDataObj.append("fields_json", JSON.stringify(fieldsObj))

//       const response = await fetch("http://localhost:8000/generate-contract-from-custom-template", {
//         method: "POST",
//         body: formDataObj,
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.detail || "Failed to generate contract")
//       }

//       const blob = await response.blob()
//       const url = window.URL.createObjectURL(blob)
//       const a = document.createElement("a")
//       a.href = url
//       const ext = customTemplateFile.name.split('.').pop()
//       a.download = `generated_contract_${Date.now()}.${ext}`
//       document.body.appendChild(a)
//       a.click()
//       document.body.removeChild(a)
//       window.URL.revokeObjectURL(url)

//       setGeneratedFile(a.download)
//       setActiveStep(2)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to generate contract")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleAddCustomField = () => {
//     setCustomFields([...customFields, { key: "", value: "" }])
//   }

//   const handleRemoveCustomField = (index: number) => {
//     setCustomFields(customFields.filter((_, i) => i !== index))
//   }

//   const handleCustomFieldChange = (index: number, field: "key" | "value", value: string) => {
//     const newFields = [...customFields]
//     newFields[index][field] = value
//     setCustomFields(newFields)
//   }

//   const isMultiline = (field: string) => {
//     return [
//       "service_description",
//       "deliverables",
//       "ip_ownership_clause",
//       "dispute_resolution_method",
//     ].includes(field)
//   }

//   const renderTemplateSelection = () => (
//     <Box>
//       <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
//         Choose a Contract Template
//       </Typography>

//       <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//         {Object.entries(CONTRACT_TEMPLATES).map(([key, template]) => (
//           <Card
//             key={key}
//             sx={{
//               bgcolor: selectedTemplate === key ? "#0d2818" : "#1a1a1a",
//               border: selectedTemplate === key ? "2px solid #4caf50" : "1px solid #333",
//               cursor: "pointer",
//               transition: "all 0.2s",
//               "&:hover": {
//                 borderColor: "#4caf50",
//                 transform: "translateY(-2px)",
//               },
//             }}
//             onClick={() => handleTemplateSelect(key)}
//           >
//             <CardContent sx={{ p: 3 }}>
//               <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
//                 <DescriptionIcon sx={{ color: "#4caf50", mr: 2, fontSize: 32 }} />
//                 <Box sx={{ flex: 1 }}>
//                   <Typography variant="h6" sx={{ color: "white", mb: 0.5 }}>
//                     {template.name}
//                   </Typography>
//                   <Typography variant="body2" sx={{ color: "#888" }}>
//                     {template.description}
//                   </Typography>
//                 </Box>
//                 {selectedTemplate === key && (
//                   <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 28 }} />
//                 )}
//               </Box>
//               <Divider sx={{ my: 2, borderColor: "#333" }} />
//               <Chip
//                 label={`${template.fields.length} fields`}
//                 size="small"
//                 sx={{ bgcolor: "#333", color: "#ccc" }}
//               />
//             </CardContent>
//           </Card>
//         ))}
//       </Box>
//     </Box>
//   )

//   const renderCustomTemplateUpload = () => (
//     <Box>
//       <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
//         Upload Your Custom Template
//       </Typography>

//       <Paper
//         sx={{
//           p: 4,
//           bgcolor: "#1a1a1a",
//           border: "2px dashed #404040",
//           borderRadius: 2,
//           textAlign: "center",
//           mb: 3,
//           cursor: "pointer",
//           "&:hover": { borderColor: "#666" },
//         }}
//         onClick={() => document.getElementById("custom-template-input")?.click()}
//       >
//         <UploadFileIcon sx={{ fontSize: 64, color: "#666", mb: 2 }} />
//         <Typography variant="body1" sx={{ color: "#888", mb: 1 }}>
//           {customTemplateFile ? customTemplateFile.name : "Click to upload template file"}
//         </Typography>
//         <Typography variant="caption" sx={{ color: "#666" }}>
//           DOCX or TXT files with placeholders like {`{{party_name}}`}
//         </Typography>
//         <input
//           id="custom-template-input"
//           type="file"
//           accept=".docx,.txt"
//           onChange={(e) => setCustomTemplateFile(e.target.files?.[0] || null)}
//           style={{ display: "none" }}
//         />
//       </Paper>

//       {customTemplateFile && (
//         <Card sx={{ bgcolor: "#0d1117", border: "1px solid #333", p: 2 }}>
//           <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//             <Box>
//               <Typography variant="body1" sx={{ color: "white" }}>
//                 {customTemplateFile.name}
//               </Typography>
//               <Typography variant="caption" sx={{ color: "#888" }}>
//                 {(customTemplateFile.size / 1024).toFixed(1)} KB
//               </Typography>
//             </Box>
//             <Button
//               size="small"
//               onClick={() => setCustomTemplateFile(null)}
//               sx={{ color: "#f44336" }}
//             >
//               <DeleteIcon />
//             </Button>
//           </Box>
//         </Card>
//       )}

//       <Alert severity="info" sx={{ mt: 3, bgcolor: "#0d1117", color: "#ccc" }}>
//         <Typography variant="body2">
//           💡 Your template should contain placeholders in the format {`{{field_name}}`}. 
//           In the next step, you'll provide values for these placeholders.
//         </Typography>
//       </Alert>
//     </Box>
//   )

//   const renderFormFields = () => {
//     if (!selectedTemplate) return null

//     const template = CONTRACT_TEMPLATES[selectedTemplate]
//     const fieldsPerColumn = Math.ceil(template.fields.length / 2)
//     const leftFields = template.fields.slice(0, fieldsPerColumn)
//     const rightFields = template.fields.slice(fieldsPerColumn)

//     return (
//       <Box>
//         <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
//           Fill Contract Details
//         </Typography>
//         <Typography variant="body2" sx={{ color: "#888", mb: 3 }}>
//           {template.name} - {template.fields.length} fields required
//         </Typography>

//         <Box sx={{ display: "flex", gap: 3 }}>
//           <Box sx={{ flex: 1 }}>
//             {leftFields.map((field) => (
//               <TextField
//                 key={field}
//                 fullWidth
//                 label={FIELD_LABELS[field] || field}
//                 value={formData[field] || ""}
//                 onChange={(e) => handleInputChange(field, e.target.value)}
//                 multiline={isMultiline(field)}
//                 rows={isMultiline(field) ? 4 : 1}
//                 sx={{
//                   mb: 2,
//                   "& .MuiInputLabel-root": { color: "#888" },
//                   "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" },
//                   "& .MuiOutlinedInput-root": {
//                     color: "white",
//                     "& fieldset": { borderColor: "#333" },
//                     "&:hover fieldset": { borderColor: "#666" },
//                     "&.Mui-focused fieldset": { borderColor: "#4caf50" },
//                   },
//                 }}
//               />
//             ))}
//           </Box>

//           <Box sx={{ flex: 1 }}>
//             {rightFields.map((field) => (
//               <TextField
//                 key={field}
//                 fullWidth
//                 label={FIELD_LABELS[field] || field}
//                 value={formData[field] || ""}
//                 onChange={(e) => handleInputChange(field, e.target.value)}
//                 multiline={isMultiline(field)}
//                 rows={isMultiline(field) ? 4 : 1}
//                 sx={{
//                   mb: 2,
//                   "& .MuiInputLabel-root": { color: "#888" },
//                   "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" },
//                   "& .MuiOutlinedInput-root": {
//                     color: "white",
//                     "& fieldset": { borderColor: "#333" },
//                     "&:hover fieldset": { borderColor: "#666" },
//                     "&.Mui-focused fieldset": { borderColor: "#4caf50" },
//                   },
//                 }}
//               />
//             ))}
//           </Box>
//         </Box>
//       </Box>
//     )
//   }

//   const renderCustomFieldsForm = () => (
//     <Box>
//       <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
//         Fill Placeholder Values
//       </Typography>
//       <Typography variant="body2" sx={{ color: "#888", mb: 3 }}>
//         Add values for the placeholders in your template (e.g., party_name, date, amount)
//       </Typography>

//       {customFields.map((field, index) => (
//         <Box key={index} sx={{ display: "flex", gap: 2, mb: 2 }}>
//           <TextField
//             fullWidth
//             label="Placeholder Name"
//             placeholder="e.g., party_name"
//             value={field.key}
//             onChange={(e) => handleCustomFieldChange(index, "key", e.target.value)}
//             sx={{
//               flex: 1,
//               "& .MuiInputLabel-root": { color: "#888" },
//               "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" },
//               "& .MuiOutlinedInput-root": {
//                 color: "white",
//                 "& fieldset": { borderColor: "#333" },
//                 "&:hover fieldset": { borderColor: "#666" },
//                 "&.Mui-focused fieldset": { borderColor: "#4caf50" },
//               },
//             }}
//           />
//           <TextField
//             fullWidth
//             label="Value"
//             placeholder="e.g., John Doe"
//             value={field.value}
//             onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
//             sx={{
//               flex: 2,
//               "& .MuiInputLabel-root": { color: "#888" },
//               "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" },
//               "& .MuiOutlinedInput-root": {
//                 color: "white",
//                 "& fieldset": { borderColor: "#333" },
//                 "&:hover fieldset": { borderColor: "#666" },
//                 "&.Mui-focused fieldset": { borderColor: "#4caf50" },
//               },
//             }}
//           />
//           {customFields.length > 1 && (
//             <Button
//               onClick={() => handleRemoveCustomField(index)}
//               sx={{ color: "#f44336", minWidth: "auto" }}
//             >
//               <DeleteIcon />
//             </Button>
//           )}
//         </Box>
//       ))}

//       <Button
//         variant="outlined"
//         onClick={handleAddCustomField}
//         sx={{
//           color: "#4caf50",
//           borderColor: "#4caf50",
//           "&:hover": { borderColor: "#66bb6a", bgcolor: "#0d2818" },
//         }}
//       >
//         + Add Field
//       </Button>
//     </Box>
//   )

//   const renderSuccess = () => (
//     <Box sx={{ textAlign: "center", py: 4 }}>
//       <CheckCircleIcon sx={{ fontSize: 80, color: "#4caf50", mb: 3 }} />
//       <Typography variant="h5" sx={{ color: "white", mb: 2 }}>
//         Contract Generated Successfully!
//       </Typography>
//       <Typography variant="body1" sx={{ color: "#888", mb: 4 }}>
//         Your contract has been downloaded: {generatedFile}
//       </Typography>

//       <Button
//         variant="contained"
//         startIcon={<DescriptionIcon />}
//         onClick={() => {
//           setActiveStep(0)
//           setSelectedTemplate("")
//           setFormData({})
//           setCustomTemplateFile(null)
//           setCustomFields([{ key: "", value: "" }])
//           setGeneratedFile(null)
//         }}
//         sx={{
//           bgcolor: "#0066cc",
//           "&:hover": { bgcolor: "#0052a3" },
//         }}
//       >
//         Create Another Contract
//       </Button>
//     </Box>
//   )

//   return (
//     <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0a", color: "white", p: 4 }}>
//       <Box sx={{ textAlign: "center", mb: 4 }}>
//         <Typography variant="h3" gutterBottom sx={{ color: "white", fontWeight: "bold" }}>
//           <DescriptionIcon sx={{ fontSize: 48, verticalAlign: "middle", mr: 2 }} />
//           Contract Generator
//         </Typography>
//         <Typography variant="body1" sx={{ color: "#888" }}>
//           Generate professional legal contracts with built-in templates or your own custom templates
//         </Typography>
//       </Box>

//       <Paper sx={{ bgcolor: "#1a1a1a", borderRadius: 3, border: "1px solid #333", p: 4, maxWidth: 1200, mx: "auto" }}>
//         <Tabs
//           value={mode === "builtin" ? 0 : 1}
//           onChange={handleModeChange}
//           sx={{
//             mb: 4,
//             "& .MuiTab-root": { color: "#888" },
//             "& .Mui-selected": { color: "#4caf50" },
//             "& .MuiTabs-indicator": { bgcolor: "#4caf50" },
//           }}
//         >
//           <Tab label="Built-in Templates" />
//           <Tab label="Custom Template" />
//         </Tabs>

//         <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
//           {steps.map((label) => (
//             <Step key={label}>
//               <StepLabel
//                 sx={{
//                   "& .MuiStepLabel-label": { color: "#888" },
//                   "& .MuiStepLabel-label.Mui-active": { color: "#4caf50" },
//                   "& .MuiStepLabel-label.Mui-completed": { color: "#4caf50" },
//                   "& .MuiStepIcon-root": { color: "#333" },
//                   "& .MuiStepIcon-root.Mui-active": { color: "#4caf50" },
//                   "& .MuiStepIcon-root.Mui-completed": { color: "#4caf50" },
//                 }}
//               >
//                 {label}
//               </StepLabel>
//             </Step>
//           ))}
//         </Stepper>

//         {error && (
//           <Alert severity="error" sx={{ mb: 3, bgcolor: "#2d0d0d", color: "white" }}>
//             {error}
//           </Alert>
//         )}

//         <Box sx={{ minHeight: 400 }}>
//           {mode === "builtin" && activeStep === 0 && renderTemplateSelection()}
//           {mode === "builtin" && activeStep === 1 && renderFormFields()}
//           {mode === "custom" && activeStep === 0 && renderCustomTemplateUpload()}
//           {mode === "custom" && activeStep === 1 && renderCustomFieldsForm()}
//           {activeStep === 2 && renderSuccess()}
//         </Box>

//         <Divider sx={{ my: 3, borderColor: "#333" }} />

//         <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//           <Button
//             disabled={activeStep === 0}
//             onClick={handleBack}
//             startIcon={<ArrowBackIcon />}
//             sx={{
//               color: "white",
//               "&:disabled": { color: "#333" },
//             }}
//           >
//             Back
//           </Button>

//           <Box sx={{ display: "flex", gap: 2 }}>
//             {activeStep === steps.length - 2 && (
//               <Button
//                 variant="contained"
//                 onClick={mode === "builtin" ? handleGenerateBuiltinContract : handleGenerateCustomContract}
//                 disabled={loading}
//                 startIcon={<DownloadIcon />}
//                 sx={{
//                   bgcolor: "#4caf50",
//                   "&:hover": { bgcolor: "#388e3c" },
//                   "&:disabled": { bgcolor: "#333" },
//                 }}
//               >
//                 {loading ? "Generating..." : "Generate Contract"}
//               </Button>
//             )}

//             {activeStep < steps.length - 2 && (
//               <Button
//                 variant="contained"
//                 onClick={handleNext}
//                 endIcon={<ArrowForwardIcon />}
//                 sx={{
//                   bgcolor: "#0066cc",
//                   "&:hover": { bgcolor: "#0052a3" },
//                 }}
//               >
//                 Next
//               </Button>
//             )}
//           </Box>
//         </Box>
//       </Paper>
//     </Box>
//   )
// }

import { useState } from "react"
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  Tabs,
  Tab,
} from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import DownloadIcon from "@mui/icons-material/Download"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import DeleteIcon from "@mui/icons-material/Delete"

interface TemplateInfo {
  name: string
  description: string
  fields: string[]
}

const CONTRACT_TEMPLATES: Record<string, TemplateInfo> = {
  rent_agreement: {
    name: "Rent Agreement",
    description: "Standard rental agreement between landlord and tenant",
    fields: [
      "landlord_name",
      "landlord_address",
      "landlord_phone",
      "landlord_email",
      "tenant_name",
      "tenant_address",
      "tenant_phone",
      "tenant_email",
      "property_address",
      "property_type",
      "rent_amount",
      "security_deposit",
      "lease_start_date",
      "lease_end_date",
      "rent_due_date",
      "late_fee",
      "utilities_included",
      "maintenance_responsibility",
      "notice_period",
    ],
  },
  hostel_agreement: {
    name: "Hostel Agreement",
    description: "Accommodation agreement for hostel residents",
    fields: [
      "hostel_name",
      "hostel_address",
      "hostel_phone",
      "hostel_email",
      "warden_name",
      "warden_phone",
      "student_name",
      "student_id",
      "student_phone",
      "student_email",
      "guardian_name",
      "guardian_phone",
      "guardian_address",
      "hostel_room_number",
      "bed_number",
      "accommodation_type",
      "hostel_monthly_rent",
      "hostel_security_deposit",
      "food_charges",
      "admission_date",
      "duration_months",
      "check_in_time",
      "check_out_time",
      "visitor_policy",
      "curfew_time",
      "maintenance_charges",
      "hostel_notice_period",
    ],
  },
  pg_agreement: {
    name: "PG Agreement",
    description: "Paying guest accommodation agreement",
    fields: [
      "owner_name",
      "owner_address",
      "owner_phone",
      "owner_email",
      "pg_name",
      "pg_address",
      "pg_phone",
      "pg_tenant_name",
      "pg_tenant_phone",
      "pg_tenant_email",
      "tenant_occupation",
      "company_name",
      "emergency_contact",
      "pg_room_number",
      "sharing_type",
      "pg_monthly_rent",
      "pg_security_deposit",
      "food_included",
      "pg_food_charges",
      "electricity_charges",
      "water_charges",
      "wifi_charges",
      "cleaning_charges",
      "pg_maintenance_charges",
      "lock_in_period",
      "pg_notice_period",
      "visitor_rules",
      "guest_policy",
    ],
  },
}

const FIELD_LABELS: Record<string, string> = {
  // Rent Agreement Fields
  landlord_name: "Landlord Name",
  landlord_address: "Landlord Address",
  landlord_phone: "Landlord Phone",
  landlord_email: "Landlord Email",
  tenant_name: "Tenant Name",
  tenant_address: "Tenant Address",
  tenant_phone: "Tenant Phone",
  tenant_email: "Tenant Email",
  property_address: "Property Address",
  property_type: "Property Type",
  rent_amount: "Monthly Rent Amount",
  security_deposit: "Security Deposit",
  lease_start_date: "Lease Start Date",
  lease_end_date: "Lease End Date",
  rent_due_date: "Rent Due Date (each month)",
  late_fee: "Late Fee Amount",
  utilities_included: "Utilities Included",
  maintenance_responsibility: "Maintenance Responsibility",
  notice_period: "Notice Period (Days)",

  // Hostel Agreement Fields
  hostel_name: "Hostel Name",
  hostel_address: "Hostel Address",
  hostel_phone: "Hostel Phone",
  hostel_email: "Hostel Email",
  warden_name: "Warden Name",
  warden_phone: "Warden Phone",
  student_name: "Student Name",
  student_id: "Student ID",
  student_phone: "Student Phone",
  student_email: "Student Email",
  guardian_name: "Guardian Name",
  guardian_phone: "Guardian Phone",
  guardian_address: "Guardian Address",
  hostel_room_number: "Room Number",
  bed_number: "Bed Number",
  accommodation_type: "Accommodation Type",
  hostel_monthly_rent: "Monthly Rent",
  hostel_security_deposit: "Security Deposit",
  food_charges: "Food Charges",
  admission_date: "Admission Date",
  duration_months: "Duration (Months)",
  check_in_time: "Check-in Time",
  check_out_time: "Check-out Time",
  visitor_policy: "Visitor Policy",
  curfew_time: "Curfew Time",
  maintenance_charges: "Maintenance Charges",
  hostel_notice_period: "Notice Period (Days)",

  // PG Agreement Fields
  owner_name: "Owner Name",
  owner_address: "Owner Address",
  owner_phone: "Owner Phone",
  owner_email: "Owner Email",
  pg_name: "PG Name",
  pg_address: "PG Address",
  pg_phone: "PG Phone",
  pg_tenant_name: "Tenant Name",
  pg_tenant_phone: "Tenant Phone",
  pg_tenant_email: "Tenant Email",
  tenant_occupation: "Tenant Occupation",
  company_name: "Company Name",
  emergency_contact: "Emergency Contact",
  pg_room_number: "Room Number",
  sharing_type: "Sharing Type",
  pg_monthly_rent: "Monthly Rent",
  pg_security_deposit: "Security Deposit",
  food_included: "Food Included",
  pg_food_charges: "Food Charges",
  electricity_charges: "Electricity Charges",
  water_charges: "Water Charges",
  wifi_charges: "WiFi Charges",
  cleaning_charges: "Cleaning Charges",
  pg_maintenance_charges: "Maintenance Charges",
  lock_in_period: "Lock-in Period",
  pg_notice_period: "Notice Period (Days)",
  visitor_rules: "Visitor Rules",
  guest_policy: "Guest Policy",
}

export default function ContractGenerator() {
  const [mode, setMode] = useState<"builtin" | "custom">("builtin")
  const [activeStep, setActiveStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [generatedFile, setGeneratedFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Custom template states
  const [customTemplateFile, setCustomTemplateFile] = useState<File | null>(null)
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([
    { key: "", value: "" }
  ])

  const steps = mode === "builtin" 
    ? ["Select Template", "Fill Details", "Generate Contract"]
    : ["Upload Template", "Fill Placeholders", "Generate Contract"]

  const handleTemplateSelect = (templateType: string) => {
    setSelectedTemplate(templateType)
    setFormData({})
    setError(null)
    setGeneratedFile(null)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleNext = () => {
    if (activeStep === 0) {
      if (mode === "builtin" && !selectedTemplate) {
        setError("Please select a contract template")
        return
      }
      if (mode === "custom" && !customTemplateFile) {
        setError("Please upload a template file")
        return
      }
    }
    setError(null)
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setError(null)
    setActiveStep((prev) => prev - 1)
  }

  const handleModeChange = (_: any, newValue: number) => {
    setMode(newValue === 0 ? "builtin" : "custom")
    setActiveStep(0)
    setSelectedTemplate("")
    setFormData({})
    setCustomTemplateFile(null)
    setCustomFields([{ key: "", value: "" }])
    setError(null)
    setGeneratedFile(null)
  }

  const handleGenerateBuiltinContract = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8000/generate-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contract_type: selectedTemplate,
          user_data: formData,
          format_type: "docx",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || "Failed to generate contract")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${selectedTemplate}_${Date.now()}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setGeneratedFile(a.download)
      setActiveStep(2)
    } catch (err) {
      console.error("Contract generation error:", err)
      setError(err instanceof Error ? err.message : "Failed to generate contract")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCustomContract = async () => {
    if (!customTemplateFile) {
      setError("Please upload a template file")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formDataObj = new FormData()
      formDataObj.append("template_file", customTemplateFile)
      
      const fieldsObj: Record<string, string> = {}
      customFields.forEach(field => {
        if (field.key && field.value) {
          fieldsObj[field.key] = field.value
        }
      })
      formDataObj.append("fields_json", JSON.stringify(fieldsObj))

      const response = await fetch("http://localhost:8000/generate-contract-from-custom-template", {
        method: "POST",
        body: formDataObj,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to generate contract")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const ext = customTemplateFile.name.split('.').pop()
      a.download = `${selectedTemplate}_${Date.now()}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setGeneratedFile(a.download)
      setActiveStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate contract")
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { key: "", value: "" }])
  }

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  const handleCustomFieldChange = (index: number, field: "key" | "value", value: string) => {
    const newFields = [...customFields]
    newFields[index][field] = value
    setCustomFields(newFields)
  }

  const isMultiline = (field: string) => {
    return [
      "utilities_included",
      "maintenance_responsibility",
      "visitor_policy",
      "visitor_rules",
      "guest_policy",
    ].includes(field)
  }

  const renderTemplateSelection = () => (
    <Box>
      <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
        Choose a Contract Template
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Object.entries(CONTRACT_TEMPLATES).map(([key, template]) => (
          <Card
            key={key}
            sx={{
              bgcolor: selectedTemplate === key ? "#0d2818" : "#1a1a1a",
              border: selectedTemplate === key ? "2px solid #4caf50" : "1px solid #333",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#4caf50",
                transform: "translateY(-2px)",
              },
            }}
            onClick={() => handleTemplateSelect(key)}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <DescriptionIcon sx={{ color: "#4caf50", mr: 2, fontSize: 32 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ color: "white", mb: 0.5 }}>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#888" }}>
                    {template.description}
                  </Typography>
                </Box>
                {selectedTemplate === key && (
                  <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 28 }} />
                )}
              </Box>
              <Divider sx={{ my: 2, borderColor: "#333" }} />
              <Chip
                label={`${template.fields.length} fields`}
                size="small"
                sx={{ bgcolor: "#333", color: "#ccc" }}
              />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )

  const renderCustomTemplateUpload = () => (
    <Box>
      <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
        Upload Your Custom Template
      </Typography>

      <Paper
        sx={{
          p: 4,
          bgcolor: "#1a1a1a",
          border: "2px dashed #404040",
          borderRadius: 2,
          textAlign: "center",
          mb: 3,
          cursor: "pointer",
          "&:hover": { borderColor: "#666" },
        }}
        onClick={() => document.getElementById("custom-template-input")?.click()}
      >
        <UploadFileIcon sx={{ fontSize: 64, color: "#666", mb: 2 }} />
        <Typography variant="body1" sx={{ color: "#888", mb: 1 }}>
          {customTemplateFile ? customTemplateFile.name : "Click to upload template file"}
        </Typography>
        <Typography variant="caption" sx={{ color: "#666" }}>
          DOCX or TXT files with placeholders like {`{{tenant_name}}`}, {`{{rent_amount}}`}, etc.
        </Typography>
        <input
          id="custom-template-input"
          type="file"
          accept=".docx,.txt"
          onChange={(e) => setCustomTemplateFile(e.target.files?.[0] || null)}
          style={{ display: "none" }}
        />
      </Paper>

      {customTemplateFile && (
        <Card sx={{ bgcolor: "#0d1117", border: "1px solid #333", p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body1" sx={{ color: "white" }}>
                {customTemplateFile.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#888" }}>
                {(customTemplateFile.size / 1024).toFixed(1)} KB
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => setCustomTemplateFile(null)}
              sx={{ color: "#f44336" }}
            >
              <DeleteIcon />
            </Button>
          </Box>
        </Card>
      )}

      <Alert severity="info" sx={{ mt: 3, bgcolor: "#0d1117", color: "#ccc" }}>
        <Typography variant="body2">
          💡 Your template should contain placeholders in the format {`{{field_name}}`}. 
          Common placeholders include: {`{{tenant_name}}`}, {`{{owner_name}}`}, {`{{rent_amount}}`}, {`{{property_address}}`}, etc.
        </Typography>
      </Alert>
    </Box>
  )

  const renderFormFields = () => {
    if (!selectedTemplate) return null

    const template = CONTRACT_TEMPLATES[selectedTemplate]
    const fieldsPerColumn = Math.ceil(template.fields.length / 2)
    const leftFields = template.fields.slice(0, fieldsPerColumn)
    const rightFields = template.fields.slice(fieldsPerColumn)

    return (
      <Box>
        <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
          Fill {template.name} Details
        </Typography>
        <Typography variant="body2" sx={{ color: "#888", mb: 3 }}>
          {template.name} - {template.fields.length} fields required
        </Typography>

        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            {leftFields.map((field) => (
              <TextField
                key={field}
                fullWidth
                label={FIELD_LABELS[field] || field}
                value={formData[field] || ""}
                onChange={(e) => handleInputChange(field, e.target.value)}
                multiline={isMultiline(field)}
                rows={isMultiline(field) ? 4 : 1}
                sx={{
                  mb: 2,
                  "& .MuiInputLabel-root": { color: "#888" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "#333" },
                    "&:hover fieldset": { borderColor: "#666" },
                    "&.Mui-focused fieldset": { borderColor: "#4caf50" },
                  },
                }}
              />
            ))}
          </Box>

          <Box sx={{ flex: 1 }}>
            {rightFields.map((field) => (
              <TextField
                key={field}
                fullWidth
                label={FIELD_LABELS[field] || field}
                value={formData[field] || ""}
                onChange={(e) => handleInputChange(field, e.target.value)}
                multiline={isMultiline(field)}
                rows={isMultiline(field) ? 4 : 1}
                sx={{
                  mb: 2,
                  "& .MuiInputLabel-root": { color: "#888" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "#333" },
                    "&:hover fieldset": { borderColor: "#666" },
                    "&.Mui-focused fieldset": { borderColor: "#4caf50" },
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    )
  }

  const renderCustomFieldsForm = () => (
    <Box>
      <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
        Fill Placeholder Values
      </Typography>
      <Typography variant="body2" sx={{ color: "#888", mb: 3 }}>
        Add values for the placeholders in your template (e.g., tenant_name, rent_amount, property_address)
      </Typography>

      {customFields.map((field, index) => (
        <Box key={index} sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Placeholder Name"
            placeholder="e.g., tenant_name"
            value={field.key}
            onChange={(e) => handleCustomFieldChange(index, "key", e.target.value)}
            sx={{
              flex: 1,
              "& .MuiInputLabel-root": { color: "#888" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" },
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "#333" },
                "&:hover fieldset": { borderColor: "#666" },
                "&.Mui-focused fieldset": { borderColor: "#4caf50" },
              },
            }}
          />
          <TextField
            fullWidth
            label="Value"
            placeholder="e.g., John Doe"
            value={field.value}
            onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
            sx={{
              flex: 2,
              "& .MuiInputLabel-root": { color: "#888" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" },
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "#333" },
                "&:hover fieldset": { borderColor: "#666" },
                "&.Mui-focused fieldset": { borderColor: "#4caf50" },
              },
            }}
          />
          {customFields.length > 1 && (
            <Button
              onClick={() => handleRemoveCustomField(index)}
              sx={{ color: "#f44336", minWidth: "auto" }}
            >
              <DeleteIcon />
            </Button>
          )}
        </Box>
      ))}

      <Button
        variant="outlined"
        onClick={handleAddCustomField}
        sx={{
          color: "#4caf50",
          borderColor: "#4caf50",
          "&:hover": { borderColor: "#66bb6a", bgcolor: "#0d2818" },
        }}
      >
        + Add Field
      </Button>
    </Box>
  )

  const renderSuccess = () => (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <CheckCircleIcon sx={{ fontSize: 80, color: "#4caf50", mb: 3 }} />
      <Typography variant="h5" sx={{ color: "white", mb: 2 }}>
        Agreement Generated Successfully!
      </Typography>
      <Typography variant="body1" sx={{ color: "#888", mb: 4 }}>
        Your agreement has been downloaded: {generatedFile}
      </Typography>

      <Button
        variant="contained"
        startIcon={<DescriptionIcon />}
        onClick={() => {
          setActiveStep(0)
          setSelectedTemplate("")
          setFormData({})
          setCustomTemplateFile(null)
          setCustomFields([{ key: "", value: "" }])
          setGeneratedFile(null)
        }}
        sx={{
          bgcolor: "#0066cc",
          "&:hover": { bgcolor: "#0052a3" },
        }}
      >
        Create Another Agreement
      </Button>
    </Box>
  )

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0a", color: "white", p: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ color: "white", fontWeight: "bold" }}>
          <DescriptionIcon sx={{ fontSize: 48, verticalAlign: "middle", mr: 2 }} />
          {/* Accommodation Agreement Generator */}
        </Typography>
        <Typography variant="body1" sx={{ color: "#888" }}>
          {/* Generate professional accommodation agreements with built-in templates or your own custom templates */}
        </Typography>
      </Box>

      <Paper sx={{ bgcolor: "#1a1a1a", borderRadius: 3, border: "1px solid #333", p: 4, maxWidth: 1200, mx: "auto" }}>
        <Tabs
          value={mode === "builtin" ? 0 : 1}
          onChange={handleModeChange}
          sx={{
            mb: 4,
            "& .MuiTab-root": { color: "#888" },
            "& .Mui-selected": { color: "#4caf50" },
            "& .MuiTabs-indicator": { bgcolor: "#4caf50" },
          }}
        >
          <Tab label="Built-in Templates" />
          <Tab label="Custom Template" />
        </Tabs>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": { color: "#888" },
                  "& .MuiStepLabel-label.Mui-active": { color: "#4caf50" },
                  "& .MuiStepLabel-label.Mui-completed": { color: "#4caf50" },
                  "& .MuiStepIcon-root": { color: "#333" },
                  "& .MuiStepIcon-root.Mui-active": { color: "#4caf50" },
                  "& .MuiStepIcon-root.Mui-completed": { color: "#4caf50" },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: "#2d0d0d", color: "white" }}>
            {error}
          </Alert>
        )}

        <Box sx={{ minHeight: 400 }}>
          {mode === "builtin" && activeStep === 0 && renderTemplateSelection()}
          {mode === "builtin" && activeStep === 1 && renderFormFields()}
          {mode === "custom" && activeStep === 0 && renderCustomTemplateUpload()}
          {mode === "custom" && activeStep === 1 && renderCustomFieldsForm()}
          {activeStep === 2 && renderSuccess()}
        </Box>

        <Divider sx={{ my: 3, borderColor: "#333" }} />

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              color: "white",
              "&:disabled": { color: "#333" },
            }}
          >
            Back
          </Button>

          <Box sx={{ display: "flex", gap: 2 }}>
            {activeStep === steps.length - 2 && (
              <Button
                variant="contained"
                onClick={mode === "builtin" ? handleGenerateBuiltinContract : handleGenerateCustomContract}
                disabled={loading}
                startIcon={<DownloadIcon />}
                sx={{
                  bgcolor: "#4caf50",
                  "&:hover": { bgcolor: "#388e3c" },
                  "&:disabled": { bgcolor: "#333" },
                }}
              >
                {loading ? "Generating..." : "Generate Agreement"}
              </Button>
            )}

            {activeStep < steps.length - 2 && (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "#0066cc",
                  "&:hover": { bgcolor: "#0052a3" },
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}