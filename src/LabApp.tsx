// @ts-nocheck
// NOTE: This is a large single-file app ported from a prototype and is not yet
// fully typed. Vite/esbuild builds and runs it as-is; `npm run typecheck` skips
// this file so it still meaningfully covers newer typed code (the Netlify
// function, entry point). Incremental typing is tracked as future work.
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
LayoutDashboard, Boxes, Users, BarChart3, Sparkles, Settings,
Plus, Trash2, ChevronDown, ChevronRight, Languages, Download, Printer,
Send, Bot, AlertTriangle, TrendingUp, TrendingDown, Activity, DollarSign,
Package, UserCog, FileText, Search, Filter, X, Check, Loader2, Zap,
Flame, Layers, Smile, Bone, Briefcase, Stethoscope, Wrench, Save,
RefreshCw, Eye, EyeOff, Archive, ArrowUpRight, ArrowDownRight, Crown,
Edit3, Copy, MoreHorizontal, Bell, Cpu, FileSpreadsheet, FileImage,
GitBranch, Clock, ArrowRight, MapPin, QrCode, Camera, ScanLine,
CheckCircle2, CircleDot, LogIn, History, Hourglass, Calendar, User
} from 'lucide-react';
import {
ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
ComposedChart, ReferenceLine
} from 'recharts';
import * as XLSX from 'xlsx';

// ═══════════════════════════════════════════════════════════════════════
//  ROOMS DEFINITION (matches workflow PDF)
// ═══════════════════════════════════════════════════════════════════════
const ROOMS = [
{ id: 'reception',  num: '01', icon: LogIn,        color: '#0891b2', ar: 'الاستقبال',       en: 'Reception',     specialty: 'reception' },
{ id: 'plaster',    num: '02', icon: Layers,       color: '#06b6d4', ar: 'غرفة الجبص',      en: 'Plaster Room',  specialty: 'plaster'   },
{ id: 'digital',    num: '03', icon: Cpu,          color: '#a78bfa', ar: 'الغرفة الرقمية',  en: 'Digital Room',  specialty: 'cadcam'    },
{ id: 'cadcam',     num: '04', icon: Wrench,       color: '#f472b6', ar: 'كاد كام وطباعة',  en: 'CAD/CAM & 3D',  specialty: 'cadcam'    },
{ id: 'processing', num: '05', icon: Activity,     color: '#fb923c', ar: 'غرفة المعالجة',   en: 'Processing',    specialty: 'processing'},
{ id: 'ceramic',    num: '06', icon: Flame,        color: '#f5b942', ar: 'غرفة السيراميك',  en: 'Ceramic Room',  specialty: 'ceramic'   },
{ id: 'office',     num: '07', icon: CheckCircle2, color: '#34d399', ar: 'المكتب والتسليم',  en: 'Office',        specialty: 'office'    },
];

const ROOM_MAP = ROOMS.reduce((acc, r) => { acc[r.id] = r; return acc; }, {});
const nextRoomId = (cur) => {
const i = ROOMS.findIndex(r => r.id === cur);
return i >= 0 && i < ROOMS.length - 1 ? ROOMS[i + 1].id : null;
};
const prevRoomId = (cur) => {
const i = ROOMS.findIndex(r => r.id === cur);
return i > 0 ? ROOMS[i - 1].id : null;
};

// Expected hours per room (used for "stuck" detection)
const ROOM_SLA_HOURS = {
reception: 2, plaster: 8, digital: 6, cadcam: 24,
processing: 8, ceramic: 16, office: 4
};

// ═══════════════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════
const TR = {
ar: {
brand: "Evora Dental",
tagline: "نظام إدارة المختبر الذكي",
dashboard: "لوحة التحكم", calculator: "حاسبة التكلفة", cases: "إدارة الحالات",
inventory: "المخزون", technicians: "الفنيون", analytics: "التحليلات",
aiAssistant: "المساعد الذكي", settings: "الإعدادات",
flow: "خط الإنتاج", scanner: "مسح QR",
overview: "نظرة عامة", liveStats: "إحصائيات مباشرة",
totalRevenue: "الإيرادات الإجمالية", monthlyProfit: "الربح الشهري",
activeCases: "الحالات النشطة", remakeRate: "معدل الإعادة",
materialCost: "تكلفة المواد", fixedCost: "التكاليف الثابتة",
breakEven: "نقطة التعادل", profitMargin: "هامش الربح",
addCase: "إضافة حالة", caseId: "رقم الحالة", patient: "المريض",
clinic: "العيادة", type: "النوع", material: "المادة",
units: "الوحدات", price: "السعر", status: "الحالة", technician: "الفني",
pending: "قيد التنفيذ", inProgress: "جاري العمل", completed: "مكتمل",
delivered: "تم التسليم", remake: "إعادة",
zirconia: "زيركون", emax: "إيماكس", implant: "زراعة",
veneer: "فينير", denture: "تركيبة متحركة", pmma: "PMMA",
ortho: "تقويم", cadcam: "كاد كام",
stock: "الكمية", reorderAt: "إعادة الطلب عند", supplier: "المورد",
lowStock: "مخزون منخفض", inStock: "متوفر", outOfStock: "غير متوفر",
productivity: "الإنتاجية", monthlyOutput: "الإنتاج الشهري",
salary: "الراتب", efficiency: "الكفاءة",
chatPlaceholder: "اسأل المساعد عن أي شيء…", thinking: "يفكر…",
welcomeAi: "أهلاً! أنا مساعدك الذكي لإدارة المختبر. كيف يمكنني المساعدة؟",
suggest1: "كم حالة عندي اليوم؟",
suggest2: "حالات متأخرة",
suggest3: "ابحث عن حالة بسم المريض",
suggest4: "إحصائيات المختبر",
exportPdf: "تصدير PDF", exportExcel: "تصدير Excel", print: "طباعة",
save: "حفظ", cancel: "إلغاء", confirm: "تأكيد", delete: "حذف",
edit: "تعديل", add: "إضافة", search: "بحث…",
saved: "✓ تم الحفظ", currency: "د.ك",
avgCostPerUnit: "متوسط التكلفة/وحدة", totalUnits: "إجمالي الوحدات",
bestScenario: "أفضل سيناريو", criticalAlert: "تنبيه حرج",
trendUp: "ارتفاع", trendDown: "انخفاض",
quickActions: "إجراءات سريعة", recentActivity: "النشاط الأخير",
// === REPORTS ===
reports: "التقارير",
reportsSubtitle: "تقارير قابلة للتصدير PDF و Excel",
monthlyReport: "تقرير شهري",
clinicReport: "تقرير عيادة",
allInvoicesReport: "كل الفواتير",
selectMonth: "اختر الشهر",
selectClinic: "اختر العيادة",
allClinics: "كل العيادات",
fromDate: "من تاريخ",
toDate: "إلى تاريخ",
reportSummary: "ملخص التقرير",
totalInvoicesInPeriod: "عدد الفواتير",
periodRevenue: "إيرادات الفترة",
periodCollected: "محصل الفترة",
periodOutstanding: "مستحق الفترة",
reportPreview: "معاينة التقرير",
exportingReport: "جاري التصدير…",
noDataInPeriod: "لا توجد بيانات في هذه الفترة",
// === MULTI-CURRENCY & VAT ===
currencySettings: "إعدادات العملة",
defaultCurrency: "العملة الافتراضية",
exchangeRate: "سعر الصرف",
currencyCode: "رمز العملة",
currencyName: "اسم العملة",
vatSettings: "إعدادات الضريبة",
vatEnabled: "تفعيل الضريبة",
vatDefaultRate: "نسبة الضريبة الافتراضية",
vatNumber: "الرقم الضريبي",
addCurrency: "إضافة عملة",
companyInfo: "معلومات الشركة",

profitBreakdown: "تحليل الأرباح", materialBreakdown: "توزيع المواد",
monthlyTrend: "الاتجاه الشهري", scenarioComparison: "مقارنة السيناريوهات",
perUnit: "لكل وحدة", perMonth: "شهرياً",
blocks: "بلوكات", consumables: "المستهلكات", mix: "نسب الإنتاج",
salaries: "الرواتب", fixedExpenses: "المصاريف الثابتة",
sellPrices: "أسعار البيع", scenarios: "السيناريوهات",
blockYield: "إنتاجية البلوك", count: "العدد", amount: "المبلغ",
revenue: "الإيراد", profit: "الربح", margin: "الهامش",
profitable: "مربح", loss: "خسارة",
aiAnalyzing: "جاري تحليل البيانات بالذكاء الاصطناعي…",
optimizePricing: "تحسين الأسعار", remakeAnalysis: "تحليل الإعادات",
salaryTracking: "تتبع الرواتب", inventoryAlerts: "تنبيهات المخزون",
addNew: "إضافة جديد", configure: "تكوين",
darkMode: "الوضع المظلم", language: "اللغة",
rename: "إعادة تسمية", duplicate: "تكرار",
healthScore: "مؤشر الصحة المالية", excellent: "ممتاز",
good: "جيد", warning: "تحذير", critical: "حرج",
aiInsights: "رؤى الذكاء الاصطناعي",
last30Days: "آخر 30 يوماً",
materialEfficiency: "كفاءة المواد",
laborCostRatio: "نسبة تكلفة العمالة",
fixedCostCoverage: "تغطية التكاليف الثابتة",
casePipeline: "خط الإنتاج",
topMaterials: "أفضل المواد",
topTechnicians: "أفضل الفنيين",
weeklyProduction: "الإنتاج الأسبوعي",
materialUsage: "استخدام المواد",
casesByType: "الحالات حسب النوع",
revenueVsCost: "الإيرادات مقابل التكلفة",
profitMarginTrend: "اتجاه هامش الربح",
quickAdd: "إضافة سريعة",
presets: "جاهز",
units_short: "وحدة",
days: "أيام",
high: "مرتفع", medium: "متوسط", low: "منخفض",
name: "الاسم",
// NEW
currentRoom: "الغرفة الحالية",
roomHistory: "سجل الغرف",
deadline: "موعد التسليم",
daysLeft: "أيام متبقية",
overdue: "متأخر",
onTime: "في الموعد",
urgent: "عاجل",
nextRoom: "الغرفة التالية",
moveNext: "نقل للتالية",
moveBack: "إرجاع",
qrCode: "رمز QR",
showQr: "عرض الرمز",
printLabel: "طباعة الملصق",
scan: "مسح",
startScan: "بدء المسح",
stopScan: "إيقاف",
scanInstructions: "وجّه الكاميرا نحو رمز QR على ورقة الحالة",
manualEntry: "إدخال يدوي",
enterCaseId: "أدخل رقم الحالة",
scanSuccess: "تم المسح بنجاح",
caseNotFound: "الحالة غير موجودة",
cameraDenied: "تم رفض إذن الكاميرا",
cameraUnsupported: "متصفحك لا يدعم المسح، استخدم الإدخال اليدوي",
selectTech: "اختر اسمك للمتابعة",
movedTo: "نُقلت إلى",
movedBy: "بواسطة",
inRoom: "في الغرفة",
stuckIn: "متوقفة في",
casesInRoom: "حالات في هذه الغرفة",
noCases: "لا توجد حالات",
productionFlow: "تدفق الإنتاج",
flowDescription: "تتبع كل حالة عبر غرف المختبر",
scanCenter: "مركز المسح",
scanDescription: "امسح رمز QR لنقل الحالة بين الغرفات",
workingOn: "يعمل على",
assignedRoom: "الغرفة المخصصة",
notifications: "الإشعارات",
noNotifications: "لا توجد إشعارات",
caseOverdue: "حالة متأخرة",
stockLow: "مخزون منخفض",
readyDelivery: "جاهزة للتسليم",
workload: "حجم العمل",
completed_room: "أُكملت في",
timeInRoom: "الوقت في الغرفة",
avgRoomTime: "متوسط الوقت/غرفة",
flowEfficiency: "كفاءة التدفق",
deliveryToday: "تسليم اليوم",
selectRoom: "اختر الغرفة",
backToFlow: "عودة للمخطط",
caseDetails: "تفاصيل الحالة",
timeline: "الجدول الزمني",
receivedAt: "استُلمت في",
hours: "ساعة", minutes: "دقيقة",
justNow: "للتو",
minAgo: "د. مضت",
hrAgo: "س. مضت",
daysAgo: "ي. مضت",
overall: "إجمالي",
// === ACCOUNTING (PROFESSIONAL) ===
accounting: "المحاسبة",
accountingSubtitle: "إدارة الإيرادات والمصاريف والفواتير",
totalIncome: "إجمالي الإيرادات",
totalExpenses: "إجمالي المصاريف",
netProfit: "صافي الربح",
outstanding: "مستحق التحصيل",
invoices: "الفواتير",
invoicesList: "قائمة الفواتير",
payments: "المدفوعات",
expensesList: "قائمة المصاريف",
addExpense: "إضافة مصروف",
addPayment: "تسجيل دفعة",
addInvoice: "إنشاء فاتورة",
newInvoice: "فاتورة جديدة",
editInvoice: "تعديل الفاتورة",
generateInvoices: "توليد فواتير من الحالات",
category: "الفئة",
expenseDate: "التاريخ",
expenseName: "البيان",
expenseNotes: "ملاحظات",
expCatMaterials: "مواد",
expCatMaintenance: "صيانة",
expCatUtilities: "مرافق",
expCatTransport: "نقل",
expCatMisc: "متنوعة",
noExpenses: "لا توجد مصاريف",
noInvoices: "لا توجد فواتير - اضغط (توليد فواتير) لإنشائها تلقائياً",
noPayments: "لا توجد مدفوعات",
noClinics: "لا توجد عيادات",
deliveredCases: "حالات مسلمة",
pendingCases: "حالات معلقة",
thisMonth: "هذا الشهر",
allTime: "كل الفترات",
paidStatus: "مدفوعة",
unpaidStatus: "غير مدفوعة",
partialPaid: "مدفوعة جزئياً",
overdueStatus: "متأخرة",
draftStatus: "مسودة",
sentStatus: "مرسلة",
cancelledStatus: "ملغاة",
markAsPaid: "تأشير كمدفوعة",
markAsSent: "تأشير كمرسلة",
// Invoice fields
invoiceNumber: "رقم الفاتورة",
invoiceDate: "تاريخ الفاتورة",
dueDate: "تاريخ الاستحقاق",
billTo: "فاتورة إلى",
items: "البنود",
itemDescription: "الوصف",
quantity: "الكمية",
unitPrice: "سعر الوحدة",
lineTotal: "الإجمالي",
subtotal: "المجموع الفرعي",
discount: "الخصم",
discountPct: "نسبة الخصم %",
tax: "الضريبة",
taxRate: "نسبة الضريبة %",
grandTotal: "المجموع النهائي",
amountPaid: "المبلغ المدفوع",
balance: "الرصيد",
notesField: "ملاحظات",
addItem: "إضافة بند",
removeItem: "حذف",
printInvoice: "طباعة الفاتورة",
sendInvoice: "إرسال",
// Payments
paymentMethod: "طريقة الدفع",
methodCash: "نقدي",
methodCard: "بطاقة",
methodBank: "تحويل بنكي",
methodCheck: "شيك",
methodOther: "أخرى",
reference: "المرجع",
recordPayment: "تسجيل دفعة",
// Clinics / Doctor Balances
clinics: "العيادات",
clinicBalances: "أرصدة العيادات",
totalBilled: "إجمالي الفواتير",
totalPaid: "إجمالي المدفوع",
balanceOwed: "الرصيد المستحق",
clinicStatement: "كشف حساب",
aging0_30: "0-30 يوم",
aging31_60: "31-60 يوم",
aging61_90: "61-90 يوم",
aging90: "أكثر من 90 يوم",
// Dashboard
cashFlow: "التدفق النقدي",
revenueVsExpenses: "الإيرادات مقابل المصاريف",
agingReport: "تقرير الأعمار",
topClinics: "أكبر العيادات",

// === Case Intake Form (NEW) ===
caseIntakeTitle: "استقبال حالة جديدة",
caseIntakeSubtitle: "إدخال معلومات الحالة الكاملة",
basicInfo: "المعلومات الأساسية",
doctorName: "اسم الطبيب",
patientName: "اسم المريض",
caseDate: "تاريخ الحالة",
caseNumber: "رقم الحالة",
shade: "الشيد",
typeOfWork: "نوع العمل",
crown: "تاج",
bridge: "جسر",
other: "أخرى",
// Materials
materialType: "نوع المادة",
zirconiaTitle: "زيركون",
emaxTitle: "إيماكس",
emaxCadTitle: "إيماكس كاد",
pmmaTitle: "PMMA",
acrylicTitle: "أكريليك",
// Tooth Selection
toothSelectionTitle: "تحديد الأسنان",
upperJaw: "الفك العلوي",
lowerJaw: "الفك السفلي",
selectedTeeth: "الأسنان المحددة",
clearSelection: "مسح التحديد",
// Intake Status
intakeStatusTitle: "حالة الاستقبال (إلزامي)",
caseCompleteStatus: "الحالة مكتملة",
caseIncompleteStatus: "ناقصة / معلقة",
// Required Info Checklist
requiredInfoTitle: "المعلومات المطلوبة",
doctorPrescription: "وصفة الطبيب موجودة",
impressionScan: "الطبعة / المسح موجود",
biteRegistration: "تسجيل العض موجود",
shadeInfo: "معلومات الشيد موجودة",
opposingArch: "الفك المقابل موجود",
// Missing Items
missingTitle: "ناقص",
missingImpression: "الطبعة / المسح",
missingBite: "تسجيل العض",
missingShade: "الشيد",
missingImplantInfo: "معلومات الزراعة",
// Implant Section
implantTitle: "الزراعة",
implantSingle: "زراعة فردية",
implantBridge: "جسر زراعة",
implantFullArch: "قوس كامل",
retentionTitle: "نوع الاحتفاظ",
screwRetained: "محمول على البرغي",
cementRetained: "محمول على الإسمنت",
implantComponents: "مكونات الزراعة",
implantSystem: "نظام الزراعة محدد",
implantPosition: "موقع الزراعة واضح",
impressionCoping: "غطاء الانطباع موجود",
analog: "المماثل (Analog) موجود",
abutment: "الدعامة موجودة",
screws: "البراغي موجودة",
scanbodyType: "نوع Scanbody محدد",
scanbodyBrandHeight: "ماركة وارتفاع Scanbody محدد",
scanbodyTight: "Scanbody مشدود (مؤكد من العيادة)",
implantLibrary: "مكتبة الزراعة متوافقة/معروفة",
stlFiles: "ملفات STL موجودة (علوي/سفلي/عض)",
// Intake Technician
intakeTechnician: "فني الاستقبال",
intakeNotes: "ملاحظات",
// Actions
saveCase: "حفظ الحالة",
cancelCase: "إلغاء",
// Deadline
deadlineUrgent: "عاجل",
deadlineWarning: "تحذير",
deadlineSafe: "في الموعد",
deadlineOverdue: "متأخر",
dayLeft: "يوم متبقي",
daysOverdue: "أيام متأخرة",

},
en: {
brand: "Evora Dental",
tagline: "Intelligent Lab Management System",
dashboard: "Dashboard", calculator: "Cost Calculator", cases: "Case Management",
inventory: "Inventory", technicians: "Technicians", analytics: "Analytics",
aiAssistant: "AI Assistant", settings: "Settings",
flow: "Production Flow", scanner: "QR Scanner",
overview: "Overview", liveStats: "Live Statistics",
totalRevenue: "Total Revenue", monthlyProfit: "Monthly Profit",
activeCases: "Active Cases", remakeRate: "Remake Rate",
materialCost: "Material Cost", fixedCost: "Fixed Costs",
breakEven: "Break-Even", profitMargin: "Profit Margin",
addCase: "Add Case", caseId: "Case ID", patient: "Patient",
clinic: "Clinic", type: "Type", material: "Material",
units: "Units", price: "Price", status: "Status", technician: "Technician",
pending: "Pending", inProgress: "In Progress", completed: "Completed",
delivered: "Delivered", remake: "Remake",
zirconia: "Zirconia", emax: "E.max", implant: "Implant",
veneer: "Veneer", denture: "Denture", pmma: "PMMA",
ortho: "Ortho", cadcam: "CAD/CAM",
stock: "Stock", reorderAt: "Reorder At", supplier: "Supplier",
lowStock: "Low Stock", inStock: "In Stock", outOfStock: "Out of Stock",
productivity: "Productivity", monthlyOutput: "Monthly Output",
salary: "Salary", efficiency: "Efficiency",
chatPlaceholder: "Ask anything about your lab…", thinking: "Thinking…",
welcomeAi: "Hi! I'm your local lab assistant. Ask me about any case, statistics, or just describe what you're looking for.",
suggest1: "How many cases today?",
suggest2: "Overdue cases",
suggest3: "Find a case by patient name",
suggest4: "Lab statistics",
exportPdf: "Export PDF", exportExcel: "Export Excel", print: "Print",
save: "Save", cancel: "Cancel", confirm: "Confirm", delete: "Delete",
edit: "Edit", add: "Add", search: "Search…",
saved: "✓ Saved", currency: "KD",
avgCostPerUnit: "Avg Cost/Unit", totalUnits: "Total Units",
bestScenario: "Best Scenario", criticalAlert: "Critical Alert",
trendUp: "Up", trendDown: "Down",
quickActions: "Quick Actions", recentActivity: "Recent Activity",
// === REPORTS ===
reports: "Reports",
reportsSubtitle: "Exportable PDF & Excel reports",
monthlyReport: "Monthly Report",
clinicReport: "Clinic Report",
allInvoicesReport: "All Invoices",
selectMonth: "Select Month",
selectClinic: "Select Clinic",
allClinics: "All Clinics",
fromDate: "From",
toDate: "To",
reportSummary: "Report Summary",
totalInvoicesInPeriod: "Invoices",
periodRevenue: "Period Revenue",
periodCollected: "Collected",
periodOutstanding: "Outstanding",
reportPreview: "Report Preview",
exportingReport: "Exporting…",
noDataInPeriod: "No data in this period",
// === MULTI-CURRENCY & VAT ===
currencySettings: "Currency Settings",
defaultCurrency: "Default Currency",
exchangeRate: "Exchange Rate",
currencyCode: "Code",
currencyName: "Currency Name",
vatSettings: "VAT/Tax Settings",
vatEnabled: "Enable VAT",
vatDefaultRate: "Default VAT Rate %",
vatNumber: "VAT/Tax Number",
addCurrency: "Add Currency",
companyInfo: "Company Info",

profitBreakdown: "Profit Breakdown", materialBreakdown: "Material Mix",
monthlyTrend: "Monthly Trend", scenarioComparison: "Scenario Comparison",
perUnit: "per unit", perMonth: "monthly",
blocks: "Blocks", consumables: "Consumables", mix: "Production Mix",
salaries: "Salaries", fixedExpenses: "Fixed Expenses",
sellPrices: "Sell Prices", scenarios: "Scenarios",
blockYield: "Block Yield", count: "Count", amount: "Amount",
revenue: "Revenue", profit: "Profit", margin: "Margin",
profitable: "Profitable", loss: "Loss",
aiAnalyzing: "AI analyzing your data…",
optimizePricing: "Pricing Optimization", remakeAnalysis: "Remake Analysis",
salaryTracking: "Salary Tracking", inventoryAlerts: "Inventory Alerts",
addNew: "Add New", configure: "Configure",
darkMode: "Dark Mode", language: "Language",
rename: "Rename", duplicate: "Duplicate",
healthScore: "Financial Health Score", excellent: "Excellent",
good: "Good", warning: "Warning", critical: "Critical",
aiInsights: "AI Insights",
last30Days: "Last 30 days",
materialEfficiency: "Material Efficiency",
laborCostRatio: "Labor Cost Ratio",
fixedCostCoverage: "Fixed Cost Coverage",
casePipeline: "Case Pipeline",
topMaterials: "Top Materials",
topTechnicians: "Top Technicians",
weeklyProduction: "Weekly Production",
materialUsage: "Material Usage",
casesByType: "Cases by Type",
revenueVsCost: "Revenue vs Cost",
profitMarginTrend: "Profit Margin Trend",
quickAdd: "Quick Add",
presets: "Presets",
units_short: "units",
days: "days",
high: "High", medium: "Medium", low: "Low",
name: "Name",
// NEW
currentRoom: "Current Room",
roomHistory: "Room History",
deadline: "Deadline",
daysLeft: "Days Left",
overdue: "Overdue",
onTime: "On Time",
urgent: "Urgent",
nextRoom: "Next Room",
moveNext: "Move Next",
moveBack: "Move Back",
qrCode: "QR Code",
showQr: "Show QR",
printLabel: "Print Label",
scan: "Scan",
startScan: "Start Scan",
stopScan: "Stop",
scanInstructions: "Point camera at the QR code on case sheet",
manualEntry: "Manual Entry",
enterCaseId: "Enter case ID",
scanSuccess: "Scanned successfully",
caseNotFound: "Case not found",
cameraDenied: "Camera permission denied",
cameraUnsupported: "Your browser doesn't support scanning, use manual entry",
selectTech: "Select your name to continue",
movedTo: "moved to",
movedBy: "by",
inRoom: "In Room",
stuckIn: "Stuck in",
casesInRoom: "cases in this room",
noCases: "No cases here",
productionFlow: "Production Flow",
flowDescription: "Track every case through lab rooms",
scanCenter: "Scan Center",
scanDescription: "Scan QR to move cases between rooms",
workingOn: "working on",
assignedRoom: "Assigned Room",
notifications: "Notifications",
noNotifications: "No notifications",
caseOverdue: "Case overdue",
stockLow: "Stock low",
readyDelivery: "Ready for delivery",
workload: "Workload",
completed_room: "Completed in",
timeInRoom: "Time in room",
avgRoomTime: "Avg time/room",
flowEfficiency: "Flow efficiency",
deliveryToday: "Delivery today",
selectRoom: "Select Room",
backToFlow: "Back to Flow",
caseDetails: "Case Details",
timeline: "Timeline",
receivedAt: "Received at",
hours: "h", minutes: "m",
justNow: "just now",
minAgo: "m ago",
hrAgo: "h ago",
daysAgo: "d ago",
overall: "Overall",
// === ACCOUNTING (PROFESSIONAL) ===
accounting: "Accounting",
accountingSubtitle: "Manage income, expenses, and invoices",
totalIncome: "Total Income",
totalExpenses: "Total Expenses",
netProfit: "Net Profit",
outstanding: "Outstanding",
invoices: "Invoices",
invoicesList: "Invoice List",
payments: "Payments",
expensesList: "Expense List",
addExpense: "Add Expense",
addPayment: "Record Payment",
addInvoice: "Create Invoice",
newInvoice: "New Invoice",
editInvoice: "Edit Invoice",
generateInvoices: "Generate from Cases",
category: "Category",
expenseDate: "Date",
expenseName: "Description",
expenseNotes: "Notes",
expCatMaterials: "Materials",
expCatMaintenance: "Maintenance",
expCatUtilities: "Utilities",
expCatTransport: "Transport",
expCatMisc: "Miscellaneous",
noExpenses: "No expenses",
noInvoices: "No invoices - click (Generate) to create from cases",
noPayments: "No payments",
noClinics: "No clinics",
deliveredCases: "Delivered Cases",
pendingCases: "Pending Cases",
thisMonth: "This Month",
allTime: "All Time",
paidStatus: "Paid",
unpaidStatus: "Unpaid",
partialPaid: "Partial",
overdueStatus: "Overdue",
draftStatus: "Draft",
sentStatus: "Sent",
cancelledStatus: "Cancelled",
markAsPaid: "Mark as Paid",
markAsSent: "Mark as Sent",
// Invoice fields
invoiceNumber: "Invoice #",
invoiceDate: "Invoice Date",
dueDate: "Due Date",
billTo: "Bill To",
items: "Items",
itemDescription: "Description",
quantity: "Qty",
unitPrice: "Unit Price",
lineTotal: "Total",
subtotal: "Subtotal",
discount: "Discount",
discountPct: "Discount %",
tax: "Tax",
taxRate: "Tax Rate %",
grandTotal: "Grand Total",
amountPaid: "Amount Paid",
balance: "Balance",
notesField: "Notes",
addItem: "Add Item",
removeItem: "Remove",
printInvoice: "Print Invoice",
sendInvoice: "Send",
// Payments
paymentMethod: "Payment Method",
methodCash: "Cash",
methodCard: "Card",
methodBank: "Bank Transfer",
methodCheck: "Check",
methodOther: "Other",
reference: "Reference",
recordPayment: "Record Payment",
// Clinics / Doctor Balances
clinics: "Clinics",
clinicBalances: "Clinic Balances",
totalBilled: "Total Billed",
totalPaid: "Total Paid",
balanceOwed: "Balance Owed",
clinicStatement: "Statement",
aging0_30: "0-30 days",
aging31_60: "31-60 days",
aging61_90: "61-90 days",
aging90: "90+ days",
// Dashboard
cashFlow: "Cash Flow",
revenueVsExpenses: "Revenue vs Expenses",
agingReport: "Aging Report",
topClinics: "Top Clinics",

// === Case Intake Form (NEW) ===
caseIntakeTitle: "New Case Intake",
caseIntakeSubtitle: "Enter complete case information",
basicInfo: "Basic Information",
doctorName: "Doctor Name",
patientName: "Patient Name",
caseDate: "Case Date",
caseNumber: "Case Number",
shade: "Shade",
typeOfWork: "Type of Work",
crown: "Crown",
bridge: "Bridge",
other: "Other",
// Materials
materialType: "Material Type",
zirconiaTitle: "Zirconia",
emaxTitle: "E-max",
emaxCadTitle: "E-max CAD",
pmmaTitle: "PMMA",
acrylicTitle: "Acrylic",
// Tooth Selection
toothSelectionTitle: "Tooth Selection",
upperJaw: "Upper Jaw",
lowerJaw: "Lower Jaw",
selectedTeeth: "Selected Teeth",
clearSelection: "Clear Selection",
// Intake Status
intakeStatusTitle: "Case Intake Status (Mandatory)",
caseCompleteStatus: "Case Complete",
caseIncompleteStatus: "Incomplete / On Hold",
// Required Info Checklist
requiredInfoTitle: "Required Information",
doctorPrescription: "Doctor prescription provided",
impressionScan: "Impression / Scan received",
biteRegistration: "Bite registration received",
shadeInfo: "Shade information provided",
opposingArch: "Opposing arch provided",
// Missing Items
missingTitle: "Missing",
missingImpression: "Impression / Scan",
missingBite: "Bite",
missingShade: "Shade",
missingImplantInfo: "Implant Information",
// Implant Section
implantTitle: "Implant",
implantSingle: "Single",
implantBridge: "Bridge",
implantFullArch: "Full Arch",
retentionTitle: "Retention",
screwRetained: "Screw-retained",
cementRetained: "Cement-retained",
implantComponents: "Implant Components",
implantSystem: "Implant system specified",
implantPosition: "Implant position clear",
impressionCoping: "Impression coping received",
analog: "Analog received",
abutment: "Abutment provided",
screws: "Screws provided",
scanbodyType: "Scanbody type specified",
scanbodyBrandHeight: "Scanbody brand & height specified",
scanbodyTight: "Scanbody tightened (confirmed by clinic)",
implantLibrary: "Implant library compatible/known",
stlFiles: "STL files received (upper/lower/bite)",
// Intake Technician
intakeTechnician: "Intake Technician",
intakeNotes: "Notes",
// Actions
saveCase: "Save Case",
cancelCase: "Cancel",
// Deadline
deadlineUrgent: "Urgent",
deadlineWarning: "Warning",
deadlineSafe: "On Time",
deadlineOverdue: "Overdue",
dayLeft: "day left",
daysOverdue: "days overdue",

}
};

// ═══════════════════════════════════════════════════════════════════════
//  PRESETS
// ═══════════════════════════════════════════════════════════════════════
const PRESETS = {
material: [
{ ar: "Ivoclar Zirconia (Premium)", en: "Ivoclar Zirconia (Premium)", price: 150, yield: 25, type: "zirconia" },
{ ar: "Multilayer Zirconia", en: "Multilayer Zirconia", price: 80, yield: 25, type: "zirconia" },
{ ar: "Tosoh Zirconia", en: "Tosoh Zirconia", price: 100, yield: 25, type: "zirconia" },
{ ar: "Upcera Zirconia", en: "Upcera Zirconia", price: 70, yield: 25, type: "zirconia" },
{ ar: "زيركون صيني/كوري", en: "Chinese/Korean Zirconia", price: 50, yield: 25, type: "zirconia" },
{ ar: "بلوك e.max CAD", en: "e.max CAD", price: 22, yield: 1, type: "emax" },
{ ar: "e.max Press Ingot", en: "e.max Press Ingot", price: 18, yield: 1, type: "emax" },
{ ar: "PMMA Disc", en: "PMMA Disc", price: 25, yield: 30, type: "pmma" },
{ ar: "PMMA Multilayer", en: "PMMA Multilayer", price: 45, yield: 30, type: "pmma" },
{ ar: "PEEK Block", en: "PEEK Block", price: 90, yield: 1, type: "peek" },
{ ar: "Titanium Disc", en: "Titanium Disc", price: 120, yield: 15, type: "implant" },
{ ar: "Cobalt-Chrome Disc", en: "Cobalt-Chrome Disc", price: 60, yield: 20, type: "metal" },
{ ar: "3D Print Resin (Crown)", en: "3D Print Resin (Crown)", price: 80, yield: 50, type: "resin" },
{ ar: "Denture Base Acrylic", en: "Denture Base Acrylic", price: 35, yield: 5, type: "denture" },
],
consumable: [
{ ar: "الغليز", en: "Glaze", price: 35, yield: 50 },
{ ar: "Stain Liquid", en: "Stain Liquid", price: 25, yield: 80 },
{ ar: "Ceramic Powder", en: "Ceramic Powder", price: 50, yield: 50 },
{ ar: "Modeling Liquid", en: "Modeling Liquid", price: 20, yield: 100 },
{ ar: "الجبص", en: "Plaster", price: 8, yield: 30 },
{ ar: "Milling Burs (set)", en: "Milling Burs (set)", price: 80, yield: 200 },
{ ar: "Investment Material", en: "Investment Material", price: 25, yield: 20 },
],
employee: [
{ ar: "فني CAD/CAM", en: "CAD/CAM Technician", count: 1, salary: 850 },
{ ar: "فني الجبص", en: "Model Technician", count: 1, salary: 650 },
{ ar: "فني السيراميك", en: "Ceramic Technician", count: 1, salary: 700 },
{ ar: "فني الزيركون", en: "Zirconia Technician", count: 1, salary: 750 },
{ ar: "فني e.max", en: "e.max Technician", count: 1, salary: 800 },
{ ar: "فني Implant", en: "Implant Technician", count: 1, salary: 900 },
{ ar: "مدير المختبر", en: "Lab Manager", count: 1, salary: 1750 },
{ ar: "محاسب", en: "Accountant", count: 1, salary: 600 },
{ ar: "مندوب مبيعات", en: "Sales Rep", count: 1, salary: 400 },
{ ar: "سائق", en: "Driver", count: 1, salary: 300 },
],
fixed: [
{ ar: "الإيجار", en: "Rent", amount: 850 },
{ ar: "كهرباء وماء", en: "Electricity & Water", amount: 50 },
{ ar: "إنترنت", en: "Internet", amount: 20 },
{ ar: "استهلاك CAD/CAM", en: "CAD/CAM Depreciation", amount: 500 },
{ ar: "استهلاك Furnace", en: "Furnace Depreciation", amount: 100 },
{ ar: "صيانة الأجهزة", en: "Equipment Maintenance", amount: 150 },
{ ar: "تأمين", en: "Insurance", amount: 80 },
{ ar: "تسويق", en: "Marketing", amount: 200 },
{ ar: "مصاريف متنوعة", en: "Miscellaneous", amount: 200 },
]
};

const uid = () => Math.random().toString(36).slice(2, 11);
const nowIso = () => new Date().toISOString();

// Add deadline N days from today as YYYY-MM-DD
const futureDateStr = (days) => {
const d = new Date();
d.setDate(d.getDate() + days);
return d.toISOString().split('T')[0];
};

const defaultState = () => ({
materials: [
{ id: uid(), name_ar: "Ivoclar Zirconia (Premium)", name_en: "Ivoclar Zirconia (Premium)", price: 150, yield: 25, type: "zirconia" },
{ id: uid(), name_ar: "زيركون صيني/كوري", name_en: "Chinese/Korean Zirconia", price: 50, yield: 25, type: "zirconia" },
{ id: uid(), name_ar: "بلوك e.max CAD", name_en: "e.max CAD", price: 22, yield: 1, type: "emax" },
],
consumables: [
{ id: uid(), name_ar: "الغليز", name_en: "Glaze", price: 35, yield: 50 },
{ id: uid(), name_ar: "السيراميك", name_en: "Ceramic", price: 50, yield: 50 },
],
mix: [
{ id: uid(), name_ar: "زيركون", name_en: "Zirconia", pct: 80, extraCost: 0 },
{ id: uid(), name_ar: "فينير سيراميك", name_en: "Veneer Ceramic", pct: 20, extraCost: 2.0 },
],
salaries: [
{ id: uid(), name_ar: "فني CAD/CAM", name_en: "CAD/CAM Technician", count: 2, salary: 850, role: "tech" },
{ id: uid(), name_ar: "فني الجبص", name_en: "Model Technician", count: 1, salary: 650, role: "tech" },
{ id: uid(), name_ar: "فني السيراميك", name_en: "Ceramic Technician", count: 1, salary: 700, role: "tech" },
{ id: uid(), name_ar: "مدير المختبر", name_en: "Lab Manager", count: 1, salary: 1750, role: "manager" },
{ id: uid(), name_ar: "مندوب", name_en: "Sales Rep", count: 1, salary: 400, role: "sales" },
{ id: uid(), name_ar: "سائق", name_en: "Driver", count: 2, salary: 300, role: "logistics" },
{ id: uid(), name_ar: "تسويق", name_en: "Marketing", count: 1, salary: 250, role: "marketing" },
],
fixed: [
{ id: uid(), name_ar: "الإيجار", name_en: "Rent", amount: 850 },
{ id: uid(), name_ar: "كهرباء وماء", name_en: "Electricity & Water", amount: 50 },
{ id: uid(), name_ar: "إنترنت", name_en: "Internet", amount: 20 },
{ id: uid(), name_ar: "استهلاك CAD/CAM", name_en: "CAD/CAM Depreciation", amount: 500 },
{ id: uid(), name_ar: "مصاريف متنوعة", name_en: "Miscellaneous", amount: 200 },
],
prices: [
{ id: uid(), name_ar: "سعر منخفض", name_en: "Low Price", value: 25 },
{ id: uid(), name_ar: "سعر مرتفع", name_en: "High Price", value: 35 },
],
quantities: [
{ id: uid(), name_ar: "100 وحدة", name_en: "100 units", value: 100 },
{ id: uid(), name_ar: "300 وحدة", name_en: "300 units", value: 300 },
{ id: uid(), name_ar: "500 وحدة", name_en: "500 units", value: 500 },
{ id: uid(), name_ar: "1000 وحدة", name_en: "1000 units", value: 1000 },
],
cases: [
{
id: uid(), caseId: "C-2606-001", patient: "Ahmed K.", clinic: "Dr. Salem Clinic",
type: "zirconia", units: 6, price: 30, status: "inProgress", technician: "Hassan",
date: "2026-05-08", remake: false,
currentRoom: "ceramic", deadline: futureDateStr(2),
roomHistory: [
{ room: "reception", at: new Date(Date.now() - 4*86400000).toISOString(), by: "Reception" },
{ room: "plaster", at: new Date(Date.now() - 3*86400000).toISOString(), by: "Ali Al-Rashidi" },
{ room: "digital", at: new Date(Date.now() - 2*86400000).toISOString(), by: "Hassan Al-Maliki" },
{ room: "cadcam", at: new Date(Date.now() - 1.5*86400000).toISOString(), by: "Hassan Al-Maliki" },
{ room: "processing", at: new Date(Date.now() - 1*86400000).toISOString(), by: "Omar Al-Qahtani" },
{ room: "ceramic", at: new Date(Date.now() - 0.5*86400000).toISOString(), by: "Mohammed Al-Enezi" },
]
},
{
id: uid(), caseId: "C-2606-002", patient: "Fatima R.", clinic: "Smile Center",
type: "emax", units: 8, price: 45, status: "inProgress", technician: "Mohammed",
date: "2026-05-09", remake: false,
currentRoom: "cadcam", deadline: futureDateStr(3),
roomHistory: [
{ room: "reception", at: new Date(Date.now() - 2*86400000).toISOString(), by: "Reception" },
{ room: "plaster", at: new Date(Date.now() - 1.5*86400000).toISOString(), by: "Ali Al-Rashidi" },
{ room: "digital", at: new Date(Date.now() - 1*86400000).toISOString(), by: "Hassan Al-Maliki" },
{ room: "cadcam", at: new Date(Date.now() - 0.2*86400000).toISOString(), by: "Hassan Al-Maliki" },
]
},
{
id: uid(), caseId: "C-2606-003", patient: "Yusuf A.", clinic: "Dr. Salem Clinic",
type: "implant", units: 2, price: 120, status: "pending", technician: "Saad",
date: "2026-05-10", remake: false,
currentRoom: "reception", deadline: futureDateStr(5),
roomHistory: [
{ room: "reception", at: new Date(Date.now() - 0.1*86400000).toISOString(), by: "Reception" },
]
},
{
id: uid(), caseId: "C-2606-004", patient: "Mariam S.", clinic: "Royal Dental",
type: "veneer", units: 10, price: 55, status: "completed", technician: "Ali",
date: "2026-05-04", remake: false,
currentRoom: "office", deadline: futureDateStr(0),
roomHistory: [
{ room: "reception", at: new Date(Date.now() - 6*86400000).toISOString(), by: "Reception" },
{ room: "plaster", at: new Date(Date.now() - 5*86400000).toISOString(), by: "Ali Al-Rashidi" },
{ room: "digital", at: new Date(Date.now() - 4*86400000).toISOString(), by: "Hassan Al-Maliki" },
{ room: "cadcam", at: new Date(Date.now() - 3*86400000).toISOString(), by: "Hassan Al-Maliki" },
{ room: "processing", at: new Date(Date.now() - 2*86400000).toISOString(), by: "Omar Al-Qahtani" },
{ room: "ceramic", at: new Date(Date.now() - 1*86400000).toISOString(), by: "Mohammed Al-Enezi" },
{ room: "office", at: new Date(Date.now() - 0.2*86400000).toISOString(), by: "Lab Manager" },
]
},
{
id: uid(), caseId: "C-2606-005", patient: "Khalid M.", clinic: "Smile Center",
type: "denture", units: 1, price: 180, status: "inProgress", technician: "Omar",
date: "2026-05-06", remake: false,
currentRoom: "plaster", deadline: futureDateStr(4),
roomHistory: [
{ room: "reception", at: new Date(Date.now() - 1*86400000).toISOString(), by: "Reception" },
{ room: "plaster", at: new Date(Date.now() - 0.5*86400000).toISOString(), by: "Ali Al-Rashidi" },
]
},
{
id: uid(), caseId: "C-2605-098", patient: "Nora B.", clinic: "Dr. Salem Clinic",
type: "zirconia", units: 4, price: 30, status: "delivered", technician: "Hassan",
date: "2026-04-22", remake: true,
currentRoom: "office", deadline: futureDateStr(-3),
roomHistory: []
},
{
id: uid(), caseId: "C-2606-006", patient: "Sara L.", clinic: "Royal Dental",
type: "pmma", units: 8, price: 20, status: "inProgress", technician: "Ali",
date: "2026-05-07", remake: false,
currentRoom: "digital", deadline: futureDateStr(1),
roomHistory: [
{ room: "reception", at: new Date(Date.now() - 3*86400000).toISOString(), by: "Reception" },
{ room: "plaster", at: new Date(Date.now() - 2*86400000).toISOString(), by: "Ali Al-Rashidi" },
{ room: "digital", at: new Date(Date.now() - 1.5*86400000).toISOString(), by: "Hassan Al-Maliki" },
]
},
],
inventory: [
{ id: uid(), name_ar: "Ivoclar Zirconia Block", name_en: "Ivoclar Zirconia Block", stock: 8, reorderAt: 5, unitPrice: 150, supplier: "Ivoclar Vivadent", category: "zirconia" },
{ id: uid(), name_ar: "زيركون صيني", name_en: "Chinese Zirconia Block", stock: 22, reorderAt: 10, unitPrice: 50, supplier: "Aidite", category: "zirconia" },
{ id: uid(), name_ar: "e.max CAD Block", name_en: "e.max CAD Block", stock: 4, reorderAt: 10, unitPrice: 22, supplier: "Ivoclar Vivadent", category: "emax" },
{ id: uid(), name_ar: "Glaze (Liquid)", name_en: "Glaze (Liquid)", stock: 3, reorderAt: 2, unitPrice: 35, supplier: "VITA", category: "consumable" },
{ id: uid(), name_ar: "Milling Burs Set", name_en: "Milling Burs Set", stock: 12, reorderAt: 5, unitPrice: 80, supplier: "Sirona", category: "tool" },
{ id: uid(), name_ar: "Titanium Disc", name_en: "Titanium Disc", stock: 2, reorderAt: 3, unitPrice: 120, supplier: "Straumann", category: "implant" },
{ id: uid(), name_ar: "PMMA Disc", name_en: "PMMA Disc", stock: 6, reorderAt: 4, unitPrice: 25, supplier: "Yamahachi", category: "pmma" },
{ id: uid(), name_ar: "Ceramic Powder", name_en: "Ceramic Powder", stock: 1, reorderAt: 2, unitPrice: 50, supplier: "VITA", category: "consumable" },
{ id: uid(), name_ar: "Investment Material", name_en: "Investment Material", stock: 14, reorderAt: 5, unitPrice: 25, supplier: "GC", category: "consumable" },
],
technicians: [
{ id: uid(), name_ar: "حسن المالكي", name_en: "Hassan Al-Maliki", role: "CAD/CAM", salary: 850, monthlyOutput: 280, efficiency: 94, specialty: "zirconia", room: "digital" },
{ id: uid(), name_ar: "محمد العنزي", name_en: "Mohammed Al-Enezi", role: "Ceramic", salary: 800, monthlyOutput: 210, efficiency: 91, specialty: "emax", room: "ceramic" },
{ id: uid(), name_ar: "علي الرشيدي", name_en: "Ali Al-Rashidi", role: "Plaster/Model", salary: 750, monthlyOutput: 195, efficiency: 88, specialty: "plaster", room: "plaster" },
{ id: uid(), name_ar: "عمر القحطاني", name_en: "Omar Al-Qahtani", role: "Processing", salary: 700, monthlyOutput: 45, efficiency: 86, specialty: "processing", room: "processing" },
{ id: uid(), name_ar: "سعد المطيري", name_en: "Saad Al-Mutairi", role: "CAD/CAM & 3D", salary: 900, monthlyOutput: 65, efficiency: 96, specialty: "cadcam", room: "cadcam" },
{ id: uid(), name_ar: "نواف الاستقبال", name_en: "Nawaf (Reception)", role: "Reception", salary: 500, monthlyOutput: 0, efficiency: 95, specialty: "reception", room: "reception" },
{ id: uid(), name_ar: "مدير المختبر", name_en: "Lab Manager", role: "Manager/QC", salary: 1750, monthlyOutput: 0, efficiency: 100, specialty: "office", room: "office" },
],
// Currently logged-in technician (for scanner)
activeTechId: null,

// === ACCOUNTING (PROFESSIONAL) ===
// Variable expenses (different from fixed monthly costs)
expenses: [],
// Invoices (smart, editable, printable)
invoices: [],
// Payments received - linked to invoices
payments: [],
// Last invoice number used (for auto-numbering)
lastInvoiceNum: 0,
// Currency settings
defaultCurrency: 'KD',
currencies: [
{ code: 'KD', name_ar: 'دينار كويتي', name_en: 'Kuwaiti Dinar', symbol: 'د.ك', rate: 1, decimals: 3 },
{ code: 'USD', name_ar: 'دولار أمريكي', name_en: 'US Dollar', symbol: '$', rate: 0.31, decimals: 2 },
{ code: 'EUR', name_ar: 'يورو', name_en: 'Euro', symbol: '€', rate: 0.28, decimals: 2 },
{ code: 'SAR', name_ar: 'ريال سعودي', name_en: 'Saudi Riyal', symbol: 'ر.س', rate: 1.15, decimals: 2 },
{ code: 'AED', name_ar: 'درهم إماراتي', name_en: 'UAE Dirham', symbol: 'د.إ', rate: 1.13, decimals: 2 },
{ code: 'JOD', name_ar: 'دينار أردني', name_en: 'Jordanian Dinar', symbol: 'د.أ', rate: 0.22, decimals: 3 },
],
// VAT settings
vatEnabled: false,
vatDefaultRate: 5, // %
vatNumber: '', // Company VAT registration number
// Expense categories
expenseCategories: [
{ id: 'materials', name_ar: 'مواد', name_en: 'Materials', color: '#34d399' },
{ id: 'maintenance', name_ar: 'صيانة', name_en: 'Maintenance', color: '#f5b942' },
{ id: 'utilities', name_ar: 'مرافق', name_en: 'Utilities', color: '#0891b2' },
{ id: 'transport', name_ar: 'نقل', name_en: 'Transport', color: '#a78bfa' },
{ id: 'misc', name_ar: 'متنوعة', name_en: 'Miscellaneous', color: '#94a3b8' },
],
});

const fmt = (n, d = 0) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
const fmt2 = (n) => Number(n || 0).toFixed(2);
const fmt3 = (n) => Number(n || 0).toFixed(3);

// Time helpers
const timeSince = (iso, lang) => {
if (!iso) return '—';
const s = (Date.now() - new Date(iso).getTime()) / 1000;
if (s < 60) return lang === 'ar' ? 'للتو' : 'just now';
const m = Math.floor(s / 60);
if (m < 60) return lang === 'ar' ? `${m} د.` : `${m}m`;
const h = Math.floor(m / 60);
if (h < 24) return lang === 'ar' ? `${h} س.` : `${h}h`;
const d = Math.floor(h / 24);
return lang === 'ar' ? `${d} ي.` : `${d}d`;
};

const hoursIn = (iso) => {
if (!iso) return 0;
return (Date.now() - new Date(iso).getTime()) / 3600000;
};

const daysUntil = (dateStr) => {
if (!dateStr) return null;
const target = new Date(dateStr + 'T23:59:59');
const diff = (target.getTime() - Date.now()) / 86400000;
return Math.ceil(diff);
};

// ═══════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function DentalLabApp() {
const [lang, setLang] = useState('en');
const [state, setState] = useState(defaultState());
const [view, setView] = useState('dashboard');
const [loading, setLoading] = useState(true);
const [savedFlash, setSavedFlash] = useState(false);
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [toast, setToast] = useState(null); // {type, msg}
const [dialog, setDialog] = useState(null); // {title, message, confirmLabel, cancelLabel, danger, resolve}

const t = TR[lang];
const isRtl = lang === 'ar';

// Load from persistent storage
useEffect(() => {
try {
if (typeof window !== 'undefined' && window.localStorage) {
const rawState = window.localStorage.getItem('dental-state');
const rawLang = window.localStorage.getItem('dental-lang');
if (rawState) {
try {
const parsed = JSON.parse(rawState);
// migration: ensure new fields exist
parsed.cases = (parsed.cases || []).map(c => ({
...c,
currentRoom: c.currentRoom || 'reception',
deadline: c.deadline || futureDateStr(5),
roomHistory: c.roomHistory || [{ room: c.currentRoom || 'reception', at: c.date || nowIso(), by: 'System' }],
}));
parsed.technicians = (parsed.technicians || []).map(tch => ({
...tch,
room: tch.room || (tch.specialty === 'zirconia' ? 'digital' : tch.specialty === 'emax' ? 'ceramic' : tch.specialty === 'plaster' ? 'plaster' : 'processing'),
}));
parsed.activeTechId = parsed.activeTechId || null;
// merge over defaults so newly-added fields always have valid values
setState({ ...defaultState(), ...parsed });
} catch {}
}
if (rawLang) setLang(rawLang);
}
} catch {}
setLoading(false);
}, []);

// Save to persistent storage (debounced)
const saveTimer = useRef(null);
useEffect(() => {
if (loading) return;
clearTimeout(saveTimer.current);
saveTimer.current = setTimeout(() => {
try {
if (typeof window !== 'undefined' && window.localStorage) {
window.localStorage.setItem('dental-state', JSON.stringify(state));
window.localStorage.setItem('dental-lang', lang);
setSavedFlash(true);
setTimeout(() => setSavedFlash(false), 1500);
}
} catch {}
}, 400);
}, [state, lang, loading]);

// ═════ Calculations ═════
const consPerUnit = useMemo(() =>
state.consumables.reduce((s, c) => s + (c.yield > 0 ? c.price / c.yield : 0), 0),
[state.consumables]
);

const mixCalc = useMemo(() => {
const total = state.mix.reduce((s, m) => s + (m.pct || 0), 0);
if (total <= 0) return { zirShare: 1, extraWeighted: 0 };
const zirShare = (state.mix[0]?.pct || 0) / total;
let extra = 0;
for (let i = 1; i < state.mix.length; i++) {
extra += ((state.mix[i].pct || 0) / total) * (state.mix[i].extraCost || 0);
}
return { zirShare, extraWeighted: extra };
}, [state.mix]);

const matCostPerUnit = useCallback((mat) => {
const main = mat.yield > 0 ? mat.price / mat.yield : 0;
return mixCalc.zirShare * (main + consPerUnit) + mixCalc.extraWeighted;
}, [consPerUnit, mixCalc]);

const totalSalaries = useMemo(() =>
state.salaries.reduce((s, e) => s + (e.count || 0) * (e.salary || 0), 0),
[state.salaries]
);
const totalFixedOther = useMemo(() =>
state.fixed.reduce((s, f) => s + (f.amount || 0), 0),
[state.fixed]
);
const totalFixed = totalSalaries + totalFixedOther;

// ═════ Currency ═════
// All monetary values are stored in the base currency (KD, rate = 1).
// `money()` converts a base amount into the active display currency and
// formats it with the correct symbol and decimal places.
const activeCurrency = useMemo(() => {
const list = state.currencies || [];
return list.find(c => c.code === state.defaultCurrency) || list[0] || { code: 'KD', symbol: 'KD', rate: 1, decimals: 2 };
}, [state.currencies, state.defaultCurrency]);

const money = useCallback((amountKD, opts = {}) => {
const cur = opts.currency
? (state.currencies || []).find(c => c.code === opts.currency) || activeCurrency
: activeCurrency;
const converted = Number(amountKD || 0) * (cur.rate || 1);
const decimals = cur.decimals ?? 2;
const num = converted.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
return opts.noSymbol ? num : `${num} ${cur.symbol || cur.code}`;
}, [activeCurrency, state.currencies]);

const kpis = useMemo(() => {
const cases = state.cases;
const totalRev = cases.reduce((s, c) => s + (c.units || 0) * (c.price || 0), 0);
const totalUnits = cases.reduce((s, c) => s + (c.units || 0), 0);
const active = cases.filter(c => c.status === 'pending' || c.status === 'inProgress').length;
const remakes = cases.filter(c => c.remake).length;
const remakeRate = cases.length > 0 ? (remakes / cases.length) * 100 : 0;
const avgMat = state.materials.length > 0
? state.materials.reduce((s, m) => s + matCostPerUnit(m), 0) / state.materials.length : 0;
const estMatCost = totalUnits * avgMat;
const estProfit = totalRev - estMatCost - totalFixed;
const margin = totalRev > 0 ? (estProfit / totalRev) * 100 : 0;
return { totalRev, totalUnits, active, remakes, remakeRate, avgMat, estMatCost, estProfit, margin };
}, [state.cases, state.materials, totalFixed, matCostPerUnit]);

// ═════ NOTIFICATIONS ═════
const notifications = useMemo(() => {
const list = [];
// Overdue cases (deadline passed, not delivered)
state.cases.forEach(c => {
if (c.status === 'delivered') return;
const left = daysUntil(c.deadline);
if (left !== null && left < 0) {
list.push({ id: 'overdue-' + c.id, type: 'danger', title: t.caseOverdue, msg: `${c.caseId} · ${c.patient}`, caseId: c.id });
} else if (left !== null && left <= 1) {
list.push({ id: 'urgent-' + c.id, type: 'warning', title: t.urgent, msg: `${c.caseId} · ${left === 0 ? t.deliveryToday : `${left} ${t.daysLeft}`}`, caseId: c.id });
}
// Stuck in room
const last = c.roomHistory && c.roomHistory.length ? c.roomHistory[c.roomHistory.length - 1] : null;
if (last && c.status !== 'delivered') {
const hrs = hoursIn(last.at);
const sla = ROOM_SLA_HOURS[c.currentRoom] || 12;
if (hrs > sla * 1.5) {
list.push({ id: 'stuck-' + c.id, type: 'warning', title: t.stuckIn + ' ' + (lang === 'ar' ? ROOM_MAP[c.currentRoom]?.ar : ROOM_MAP[c.currentRoom]?.en), msg: `${c.caseId} · ${Math.round(hrs)}${t.hours}`, caseId: c.id });
}
}
});
// Low stock
state.inventory.forEach(it => {
if (it.stock <= it.reorderAt) {
list.push({ id: 'stock-' + it.id, type: 'warning', title: t.stockLow, msg: lang === 'ar' ? (it.name_ar || it.name_en) : (it.name_en || it.name_ar) });
}
});
return list;
}, [state.cases, state.inventory, t, lang]);

// ═════ Helpers ═════
const setField = (list, id, field, value) => {
setState(s => ({
...s,
[list]: s[list].map(item => {
if (item.id !== id) return item;
if (field === 'name') return { ...item, name_ar: value, name_en: value };
const isNum = ['price', 'yield', 'count', 'salary', 'amount', 'value', 'pct', 'extraCost', 'stock', 'reorderAt', 'unitPrice', 'units', 'monthlyOutput', 'efficiency'].includes(field);
return { ...item, [field]: isNum ? (parseFloat(value) || 0) : value };
})
}));
};

const addItem = (list, item) => {
setState(s => ({ ...s, [list]: [...s[list], { id: uid(), ...item }] }));
};

const removeItem = (list, id) => {
setState(s => ({ ...s, [list]: s[list].filter(x => x.id !== id) }));
};

const getName = (item) => lang === 'ar' ? (item.name_ar || item.name_en) : (item.name_en || item.name_ar);

const toastTimer = useRef(null);
const showToast = (type, msg, action = null) => {
clearTimeout(toastTimer.current);
setToast({ type, msg, action });
toastTimer.current = setTimeout(() => setToast(null), action ? 5000 : 2500);
};

// Remove a list item but keep it recoverable via an Undo toast.
const removeItemUndo = (list, id, label) => {
let removed = null;
setState(s => {
removed = s[list].find(x => x.id === id) || null;
return { ...s, [list]: s[list].filter(x => x.id !== id) };
});
showToast('warning', `${lang === 'ar' ? 'تم الحذف' : 'Deleted'}${label ? ` · ${label}` : ''}`, {
label: lang === 'ar' ? 'تراجع' : 'Undo',
fn: () => { if (removed) setState(s => ({ ...s, [list]: [...s[list], removed] })); },
});
};

// Themed confirmation dialog. Returns a Promise<boolean> that resolves to the
// user's choice. Replaces native window.confirm so the prompt matches the UI.
const askConfirm = (opts) => new Promise((resolve) => {
setDialog({
title: opts.title || (lang === 'ar' ? 'تأكيد' : 'Confirm'),
message: opts.message || '',
confirmLabel: opts.confirmLabel || (lang === 'ar' ? 'تأكيد' : 'Confirm'),
cancelLabel: opts.cancelLabel || (lang === 'ar' ? 'إلغاء' : 'Cancel'),
danger: !!opts.danger,
resolve,
});
});
const resolveDialog = (value) => {
setDialog(d => { d?.resolve?.(value); return null; });
};

// Move case to a target room. Records who did it.
const moveCaseToRoom = (caseId, targetRoomId, byName) => {
let success = false;
let foundCase = null;
let deductMaterial = null; // material category to draw from inventory on completion
setState(s => {
const newCases = s.cases.map(c => {
if (c.id !== caseId) return c;
success = true;
foundCase = c;
const newHistory = [...(c.roomHistory || []), { room: targetRoomId, at: nowIso(), by: byName || 'Unknown' }];
let newStatus = c.status;
if (targetRoomId === 'office') newStatus = 'completed';
else if (c.status === 'pending') newStatus = 'inProgress';
// On completion, draw one matching block/disc from inventory (once).
const justCompleted = targetRoomId === 'office' && !c.inventoryDeducted;
if (justCompleted) deductMaterial = c.type;
return { ...c, currentRoom: targetRoomId, status: newStatus, roomHistory: newHistory, inventoryDeducted: c.inventoryDeducted || justCompleted };
});
// Auto-deduct inventory: first in-stock item whose category matches the case material.
let newInventory = s.inventory;
if (deductMaterial) {
let done = false;
newInventory = s.inventory.map(it => {
if (!done && it.category === deductMaterial && (it.stock || 0) > 0) {
done = true;
return { ...it, stock: it.stock - 1 };
}
return it;
});
}
return { ...s, cases: newCases, inventory: newInventory };
});
return { success, case: foundCase };
};

const moveCaseByQrCode = (scannedText, byName) => {
// scannedText might be the caseId (e.g., "C-2606-001") or our URL format
let cid = scannedText.trim();
// accept formats like "evora://case/C-2606-001"
const m = cid.match(/case[/:]([A-Z0-9-]+)/i);
if (m) cid = m[1];
const found = state.cases.find(c => c.caseId.toUpperCase() === cid.toUpperCase());
if (!found) return { success: false, reason: 'notfound' };
const next = nextRoomId(found.currentRoom);
if (!next) return { success: false, reason: 'finished' };
moveCaseToRoom(found.id, next, byName);
return { success: true, case: found, newRoom: next };
};

const handleReset = async () => {
const ok = await askConfirm({
title: lang === 'ar' ? 'إعادة تعيين البيانات' : 'Reset Data',
message: lang === 'ar' ? 'هل أنت متأكد من إعادة تعيين كل البيانات إلى الإعدادات الافتراضية؟ لا يمكن التراجع.' : 'Reset all data to defaults? This cannot be undone.',
confirmLabel: lang === 'ar' ? 'إعادة تعيين' : 'Reset',
danger: true,
});
if (ok) {
setState(defaultState());
showToast('success', lang === 'ar' ? 'تمت إعادة التعيين' : 'Data reset');
}
};

const setActiveTech = (techId) => setState(s => ({ ...s, activeTechId: techId }));

const ctx = {
state, setState, lang, t, isRtl, getName, fmt, fmt2, fmt3,
setField, addItem, removeItem,
matCostPerUnit, totalSalaries, totalFixed, totalFixedOther,
consPerUnit, kpis,
notifications, moveCaseToRoom, moveCaseByQrCode, setActiveTech, showToast,
money, activeCurrency, askConfirm, removeItemUndo,
};

if (loading) {
return (

<div className="min-h-screen flex items-center justify-center" style={{ background: '#eef3fa' }}>
<div className="flex flex-col items-center gap-4">
<div className="relative">
<div className="w-12 h-12 rounded-full border-2 border-cyan-500/20"></div>
<div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin"></div>
</div>
<div className="text-sm tracking-widest uppercase" style={{ color: '#0891b2' }}>Loading Evora</div>
</div>
</div>
);
}

return (

<div
dir={isRtl ? 'rtl' : 'ltr'}
className="min-h-screen relative overflow-x-hidden"
style={{
background: '#eef3fa',
fontFamily: lang === 'ar'
? "'Tajawal', 'Manrope', system-ui, sans-serif"
: "'Manrope', system-ui, sans-serif",
color: '#0f2942',
}}
>
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500;600;700&family=Tajawal:wght@300;400;500;700;900&display=swap');

:root {
  --bg: #eef3fa;
  --bg-2: #ffffff;
  --surface: #ffffff;
  --surface-strong: #ffffff;
  --border: rgba(15, 50, 90, 0.08);
  --border-bright: rgba(6, 182, 212, 0.28);
  --text: #0f2942;
  --text-2: #46586f;
  --text-3: #8593a6;
  --cyan: #0891b2;
  --cyan-bright: #2563eb;
  --gold: #d97706;
  --green: #059669;
  --red: #e11d48;
  --purple: #7c3aed;
  --pink: #db2777;
  --brand-grad: linear-gradient(135deg, #06b6d4, #2563eb);
}

.display-font { font-family: 'Fraunces', serif; font-feature-settings: "ss01" on, "ss02" on; }
.mono { font-family: 'JetBrains Mono', monospace; }

.ambient {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 1000px 600px at 12% -10%, rgba(6, 182, 212, 0.10), transparent 60%),
    radial-gradient(ellipse 900px 500px at 100% 0%, rgba(37, 99, 235, 0.08), transparent 60%),
    radial-gradient(ellipse 700px 500px at 50% 110%, rgba(6, 182, 212, 0.06), transparent 60%);
}
.grid-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(15, 50, 90, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 50, 90, 0.035) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}
.noise { display: none; }

.glass {
  background: #ffffff;
  border: 1px solid var(--border);
  box-shadow:
    0 1px 2px 0 rgba(16, 24, 40, 0.04),
    0 10px 28px -14px rgba(16, 24, 40, 0.18);
}
.glass-strong {
  background: #ffffff;
  border: 1px solid var(--border-bright);
  box-shadow:
    0 2px 4px 0 rgba(16, 24, 40, 0.05),
    0 18px 44px -16px rgba(16, 24, 40, 0.28);
}

.scroll-y { overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(15,50,90,0.18) transparent; }
.scroll-y::-webkit-scrollbar { width: 6px; height: 6px; }
.scroll-y::-webkit-scrollbar-thumb { background: rgba(15,50,90,0.18); border-radius: 3px; }
.scroll-y::-webkit-scrollbar-track { background: transparent; }

input, textarea, select { font-family: inherit; }
input.themed, textarea.themed, select.themed {
  background: #f6f8fb;
  border: 1px solid rgba(15, 50, 90, 0.14);
  color: var(--text);
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.15s;
  width: 100%;
  font-size: 13px;
}
input.themed:focus, textarea.themed:focus, select.themed:focus {
  outline: none;
  border-color: var(--cyan);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
}
input.themed::placeholder { color: var(--text-3); }
input[type=number].themed { font-family: 'JetBrains Mono', monospace; text-align: center; }
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; }

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 12.5px;
  cursor: pointer; transition: all 0.15s; border: 1px solid transparent;
  font-family: inherit; white-space: nowrap;
}
.btn-primary {
  background: var(--brand-grad);
  color: #ffffff; box-shadow: 0 6px 18px -6px rgba(37, 99, 235, 0.55);
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 26px -6px rgba(37, 99, 235, 0.7); }
.btn-ghost {
  background: #f1f5f9;
  border: 1px solid rgba(15, 50, 90, 0.10);
  color: var(--text-2);
}
.btn-ghost:hover { background: #e7edf4; border-color: rgba(15, 50, 90, 0.18); color: var(--text); }
.btn-danger {
  background: rgba(225, 29, 72, 0.08);
  border: 1px solid rgba(225, 29, 72, 0.22);
  color: var(--red);
}
.btn-danger:hover { background: rgba(225, 29, 72, 0.15); }

.glow-cyan { box-shadow: 0 8px 24px -8px rgba(6, 182, 212, 0.5); }
.glow-gold { box-shadow: 0 8px 24px -8px rgba(217, 119, 6, 0.35); }

@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
@keyframes scanLine { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(220px); } }
.fade-up { animation: fadeUp 0.4s ease-out backwards; }
.pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
.scan-line { animation: scanLine 2.5s ease-in-out infinite; }

.data-card { transition: all 0.2s; }
.data-card:hover { transform: translateY(-2px); border-color: rgba(6, 182, 212, 0.35); box-shadow: 0 14px 32px -16px rgba(16, 24, 40, 0.25); }

.accent-bar {
  width: 3px;
  background: var(--brand-grad);
  border-radius: 0 3px 3px 0;
}
body[dir="rtl"] .accent-bar { border-radius: 3px 0 0 3px; }

.text-glow { text-shadow: none; }

.tab-btn {
  padding: 10px 14px; border-radius: 8px; font-weight: 600; font-size: 12.5px;
  color: var(--text-2); cursor: pointer; transition: all 0.15s; background: transparent;
  border: 1px solid transparent;
}
.tab-btn.active {
  color: #0e7490; background: rgba(6, 182, 212, 0.12);
  border-color: rgba(6, 182, 212, 0.30);
}
.tab-btn:hover:not(.active) { color: var(--text); background: rgba(15, 50, 90, 0.05); }

.nav-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px;
  border-radius: 10px; cursor: pointer; color: var(--text-2);
  font-size: 13px; font-weight: 500; transition: all 0.15s;
  border: 1px solid transparent;
}
.nav-item:hover { background: rgba(15, 50, 90, 0.05); color: var(--text); }
.nav-item.active {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.14), rgba(37, 99, 235, 0.06));
  border-color: rgba(6, 182, 212, 0.28);
  color: #0e7490;
}
.nav-item.active .nav-icon { color: var(--cyan); }

.flow-arrow { stroke: rgba(15, 50, 90, 0.22); }

@media (max-width: 1024px) {
  .desktop-sidebar { display: none; }
}

@media print {
  .desktop-sidebar, .mobile-nav, .top-bar, .no-print { display: none !important; }
  .main-area { padding: 20px !important; }
}

/* Room workflow lines */
.flow-arrow {
  stroke: rgba(120, 180, 255, 0.25);
  stroke-width: 2;
  fill: none;
  stroke-dasharray: 4 4;
}

`}</style>

  <div className="ambient" />
  <div className="grid-overlay" />
  <div className="noise" />

  <div className="relative z-10 flex min-h-screen">
    <Sidebar
      view={view} setView={setView} t={t} isRtl={isRtl}
      lang={lang} sidebarCollapsed={sidebarCollapsed}
      mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
      notifCount={notifications.length}
    />

<main className="flex-1 min-w-0 main-area">
  <TopBar
    t={t} lang={lang} setLang={setLang} savedFlash={savedFlash}
    mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
    handleReset={handleReset} view={view}
    notifications={notifications} setView={setView}
  />

  <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
    {view === 'dashboard' && <Dashboard ctx={ctx} setView={setView} />}
    {view === 'flow' && <ProductionFlowView ctx={ctx} setView={setView} />}
    {view === 'scanner' && <ScannerView ctx={ctx} />}
    {view === 'cases' && <CasesView ctx={ctx} />}
    {view === 'inventory' && <InventoryView ctx={ctx} />}
    {view === 'technicians' && <TechniciansView ctx={ctx} />}
    {view === 'accounting' && <AccountingView ctx={ctx} />}
    {view === 'analytics' && <AnalyticsView ctx={ctx} />}
    {view === 'ai' && <AIAssistant ctx={ctx} />}
    {view === 'settings' && <SettingsView ctx={ctx} setLang={setLang} handleReset={handleReset} />}
  </div>
</main>

  </div>

{/* Toast */}
{toast && (
<div
className="fixed bottom-6 left-1/2 z-50"
style={{
transform: 'translateX(-50%)',
animation: 'slideUp 0.3s ease-out',
}}
>
<div
className="glass-strong rounded-xl px-5 py-3 flex items-center gap-3"
style={{
borderColor: toast.type === 'success' ? 'rgba(52, 211, 153, 0.4)' : toast.type === 'error' ? 'rgba(248, 113, 113, 0.4)' : 'rgba(245, 185, 66, 0.4)',
minWidth: 280,
}}
>
{toast.type === 'success' ? <CheckCircle2 size={18} color="#34d399" /> :
toast.type === 'error' ? <AlertTriangle size={18} color="#f87171" /> :
<Bell size={18} color="#f5b942" />}
<div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{toast.msg}</div>
{toast.action && (
<button
onClick={() => { toast.action.fn(); setToast(null); }}
className="ml-2 text-[12px] font-bold px-2.5 py-1 rounded-md shrink-0"
style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#0891b2' }}
>
{toast.action.label}
</button>
)}
</div>
</div>
)}

{/* Themed confirmation dialog */}
{dialog && (
<div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} onClick={() => resolveDialog(false)}>
<div className="glass-strong rounded-2xl w-full max-w-md p-6" style={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid rgba(120, 180, 255, 0.2)', animation: 'slideUp 0.25s ease-out' }} onClick={e => e.stopPropagation()}>
<div className="flex items-start gap-3 mb-4">
<div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: dialog.danger ? 'rgba(248, 113, 113, 0.15)' : 'rgba(56, 189, 248, 0.15)', border: `1px solid ${dialog.danger ? 'rgba(248, 113, 113, 0.3)' : 'rgba(56, 189, 248, 0.3)'}` }}>
<AlertTriangle size={18} color={dialog.danger ? '#f87171' : '#0891b2'} />
</div>
<div className="flex-1 min-w-0">
<div className="text-[15px] font-bold mb-1" style={{ color: 'var(--text)' }}>{dialog.title}</div>
<div className="text-[12.5px]" style={{ color: 'var(--text-2)', lineHeight: 1.55 }}>{dialog.message}</div>
</div>
</div>
<div className="flex gap-2 justify-end">
<button onClick={() => resolveDialog(false)} className="btn btn-ghost">{dialog.cancelLabel}</button>
<button onClick={() => resolveDialog(true)} className={`btn ${dialog.danger ? 'btn-danger' : 'btn-primary'}`}>{dialog.confirmLabel}</button>
</div>
</div>
</div>
)}

</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════════════════════
function Sidebar({ view, setView, t, isRtl, lang, mobileMenuOpen, setMobileMenuOpen, notifCount }) {
const navItems = [
{ id: 'dashboard', icon: LayoutDashboard, label: t.dashboard, group: 'main' },
{ id: 'flow', icon: GitBranch, label: t.flow, group: 'main', highlight: 'NEW' },
{ id: 'scanner', icon: ScanLine, label: t.scanner, group: 'main', highlight: 'QR' },
{ id: 'cases', icon: Briefcase, label: t.cases, group: 'main' },
{ id: 'inventory', icon: Boxes, label: t.inventory, group: 'ops' },
{ id: 'technicians', icon: UserCog, label: t.technicians, group: 'ops' },
{ id: 'accounting', icon: DollarSign, label: t.accounting, group: 'ops', highlight: 'NEW' },
{ id: 'analytics', icon: BarChart3, label: t.analytics, group: 'insight' },
{ id: 'ai', icon: Sparkles, label: t.aiAssistant, group: 'insight', highlight: 'AI' },
{ id: 'settings', icon: Settings, label: t.settings, group: 'system' },
];

const handleClick = (id) => {
setView(id);
setMobileMenuOpen(false);
};

return (
<>
{mobileMenuOpen && (

<div
className="fixed inset-0 bg-black/60 z-40 lg:hidden"
onClick={() => setMobileMenuOpen(false)}
/>
)}
<aside
className={`desktop-sidebar w-64 shrink-0 border-r border-l-0 ${isRtl ? 'border-l border-r-0' : ''} sticky top-0 h-screen scroll-y glass`}
style={{
borderColor: 'rgba(120, 180, 255, 0.08)',
background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(248, 250, 252, 0.96))',
backdropFilter: 'blur(20px)',
}}
>
<SidebarContent navItems={navItems} view={view} handleClick={handleClick} t={t} lang={lang} notifCount={notifCount} />
</aside>

  <aside
    className={`fixed top-0 ${isRtl ? 'right-0' : 'left-0'} bottom-0 w-72 z-50 lg:hidden transform transition-transform duration-300 scroll-y glass`}
    style={{
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.98))',
      transform: mobileMenuOpen ? 'translateX(0)' : (isRtl ? 'translateX(100%)' : 'translateX(-100%)'),
      borderRight: isRtl ? 'none' : '1px solid rgba(120, 180, 255, 0.15)',
      borderLeft: isRtl ? '1px solid rgba(120, 180, 255, 0.15)' : 'none',
    }}
  >
    <SidebarContent navItems={navItems} view={view} handleClick={handleClick} t={t} lang={lang} notifCount={notifCount} />
  </aside>
</>

);
}

function SidebarContent({ navItems, view, handleClick, t, lang, notifCount }) {
return (

<div className="p-5">
<div className="flex items-center gap-3 mb-8 pb-5 border-b" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
<div
className="w-11 h-11 rounded-xl flex items-center justify-center relative glow-cyan"
style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}
>
<Stethoscope size={20} strokeWidth={2.2} color="#ffffff" />
<div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 pulse-soft" />
</div>
<div className="leading-tight">
<div className="display-font text-lg font-semibold tracking-tight" style={{ color: '#0f2942' }}>
{t.brand}
</div>
<div className="text-[10.5px] uppercase tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.12em' }}>
{lang === 'ar' ? 'النظام v6.0' : 'System v6.0'}
</div>
</div>
</div>

  <nav className="space-y-1">
    <div className="text-[10px] uppercase font-bold mb-2 px-2" style={{ color: 'var(--text-3)', letterSpacing: '0.14em' }}>
      {lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
    </div>
    {navItems.map(item => (
      <div
        key={item.id}
        className={`nav-item ${view === item.id ? 'active' : ''}`}
        onClick={() => handleClick(item.id)}
      >
        <item.icon size={17} strokeWidth={2} className="nav-icon shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.highlight && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{
              background: item.highlight === 'NEW' ? 'rgba(52, 211, 153, 0.15)' :
                          item.highlight === 'QR' ? 'rgba(167, 139, 250, 0.15)' :
                          'rgba(245, 185, 66, 0.15)',
              color: item.highlight === 'NEW' ? '#34d399' :
                     item.highlight === 'QR' ? '#a78bfa' :
                     '#f5b942'
            }}
          >
            {item.highlight}
          </span>
        )}
      </div>
    ))}
  </nav>

  <div className="mt-8 p-3.5 rounded-xl" style={{ background: 'rgba(56, 189, 248, 0.04)', border: '1px solid rgba(56, 189, 248, 0.12)' }}>
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-soft" />
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
        {lang === 'ar' ? 'متصل' : 'Online'}
      </div>
    </div>
    <div className="text-[10.5px]" style={{ color: 'var(--text-3)' }}>
      {lang === 'ar' ? 'البيانات محفوظة محلياً' : 'Data synced locally'}
    </div>
  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  TOP BAR
// ═══════════════════════════════════════════════════════════════════════
function TopBar({ t, lang, setLang, savedFlash, mobileMenuOpen, setMobileMenuOpen, view, notifications, setView }) {
const [showNotif, setShowNotif] = useState(false);
const viewTitles = {
dashboard: t.dashboard, calculator: t.calculator, cases: t.cases,
inventory: t.inventory, technicians: t.technicians,
accounting: t.accounting, analytics: t.analytics,
ai: t.aiAssistant, settings: t.settings, flow: t.flow, scanner: t.scanner,
};

return (

<div
className="top-bar sticky top-0 z-30 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3 border-b"
style={{
background: 'linear-gradient(180deg, rgba(246, 248, 251, 0.9), rgba(246, 248, 251, 0.9))',
backdropFilter: 'blur(16px)',
borderColor: 'rgba(120, 180, 255, 0.08)',
}}
>
<div className="flex items-center gap-3 min-w-0">
<button
onClick={() => setMobileMenuOpen(true)}
className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center"
style={{ background: 'rgba(120, 180, 255, 0.08)', border: '1px solid rgba(120, 180, 255, 0.12)' }}
>
<Layers size={17} color="#94a3c4" />
</button>
<div className="min-w-0">
<div className="text-[10.5px] uppercase tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.14em' }}>
{lang === 'ar' ? 'النظام' : 'Workspace'}
</div>
<div className="display-font text-lg md:text-xl font-semibold truncate" style={{ color: 'var(--text)' }}>
{viewTitles[view] || t.dashboard}
</div>
</div>
</div>

  <div className="flex items-center gap-2">
    <div
      className={`hidden md:flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-opacity ${savedFlash ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(52, 211, 153, 0.12)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.25)' }}
    >
      <Check size={11} /> {t.saved}
    </div>

{/* Notifications */}
<div className="relative">
  <button
    onClick={() => setShowNotif(!showNotif)}
    className="w-9 h-9 rounded-lg flex items-center justify-center relative"
    style={{ background: 'rgba(120, 180, 255, 0.08)', border: '1px solid rgba(120, 180, 255, 0.12)' }}
  >
    <Bell size={15} color="#94a3c4" />
    {notifications.length > 0 && (
      <div className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: '#f87171', color: '#fff' }}>
        {notifications.length}
      </div>
    )}
  </button>
  {showNotif && (
    <>
      <div className="fixed inset-0 z-30" onClick={() => setShowNotif(false)} />
      <div
        className="absolute top-12 right-0 w-80 max-h-96 scroll-y glass-strong rounded-xl z-40"
        style={{ background: 'rgba(255, 255, 255, 0.98)' }}
      >
        <div className="p-3 border-b" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
          <div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{t.notifications}</div>
          <div className="text-[11px]" style={{ color: 'var(--text-3)' }}>{notifications.length} {lang === 'ar' ? 'تنبيه' : 'alerts'}</div>
        </div>
        <div className="p-2 space-y-1.5">
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-[12px]" style={{ color: 'var(--text-3)' }}>
              <CheckCircle2 size={24} className="mx-auto mb-1 opacity-40" />
              {t.noNotifications}
            </div>
          ) : notifications.slice(0, 12).map(n => (
            <div
              key={n.id}
              onClick={() => { if (n.caseId) setView('cases'); setShowNotif(false); }}
              className="p-2.5 rounded-lg cursor-pointer"
              style={{
                background: n.type === 'danger' ? 'rgba(248, 113, 113, 0.08)' : 'rgba(245, 185, 66, 0.06)',
                border: `1px solid ${n.type === 'danger' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(245, 185, 66, 0.18)'}`,
              }}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle size={12} color={n.type === 'danger' ? '#f87171' : '#f5b942'} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold truncate" style={{ color: 'var(--text)' }}>{n.title}</div>
                  <div className="text-[11px] truncate" style={{ color: 'var(--text-2)' }}>{n.msg}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )}
</div>

<button
  onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
  className="w-9 h-9 rounded-lg flex items-center justify-center"
  style={{ background: 'rgba(120, 180, 255, 0.08)', border: '1px solid rgba(120, 180, 255, 0.12)' }}
>
  <Languages size={15} color="#94a3c4" />
</button>

  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════════════
function Dashboard({ ctx, setView }) {
const { state, t, lang, kpis, fmt, fmt2, totalFixed, isRtl, notifications, addItem } = ctx;
const [showIntakeModal, setShowIntakeModal] = useState(false);
const [selectedCase, setSelectedCase] = useState(null);
const handleSaveCase = (caseData) => addItem('cases', caseData);

// Cases per room (live counter)
const casesPerRoom = useMemo(() => {
const map = {};
ROOMS.forEach(r => { map[r.id] = 0; });
state.cases.forEach(c => {
if (c.status !== 'delivered' && map[c.currentRoom] !== undefined) map[c.currentRoom]++;
});
return map;
}, [state.cases]);

const todayDeliveries = useMemo(() => {
const today = new Date().toISOString().split('T')[0];
return state.cases.filter(c => c.deadline === today && c.status !== 'delivered').length;
}, [state.cases]);

const overdueCases = useMemo(() => {
return state.cases.filter(c => {
if (c.status === 'delivered') return false;
const left = daysUntil(c.deadline);
return left !== null && left < 0;
}).length;
}, [state.cases]);

return (
<>

<div className="space-y-5">
{/* Hero KPIs */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
<button
onClick={() => setShowIntakeModal(true)}
className="glass rounded-xl p-4 data-card text-left transition relative overflow-hidden group"
style={{
background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(167, 139, 250, 0.12))',
border: '1px solid rgba(56, 189, 248, 0.3)',
boxShadow: '0 4px 20px rgba(56, 189, 248, 0.15)',
cursor: 'pointer',
}}
>
<div 
className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(167, 139, 250, 0.2))' }}
/>
<div className="relative flex items-start justify-between mb-2">
<div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
<Plus size={18} color="#0891b2" strokeWidth={2.5} />
</div>
<div 
className="w-8 h-8 rounded-lg flex items-center justify-center"
style={{ background: 'rgba(56, 189, 248, 0.15)' }}
>
<ArrowRight size={14} color="#0891b2" />
</div>
</div>
<div className="relative">
<div className="text-[10.5px] uppercase font-bold tracking-widest mb-1" style={{ color: '#0891b2', letterSpacing: '0.14em' }}>
{t.addCase}
</div>
<div className="display-font text-base md:text-lg font-bold" style={{ color: 'var(--text)' }}>
{lang === 'ar' ? 'إضافة حالة جديدة' : 'Add New Case'}
</div>
<div className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>
{lang === 'ar' ? 'استقبال حالة جديدة' : 'Start case intake'}
</div>
</div>
</button>
<KpiCard
label={t.activeCases} value={kpis.active} sub={`${state.cases.length} ${t.overall}`}
color="#0891b2" icon={Briefcase}
/>
<KpiCard
label={t.profitMargin} value={`${fmt2(kpis.margin)}%`} sub={t.healthScore}
color={kpis.margin >= 25 ? '#34d399' : kpis.margin >= 10 ? '#f5b942' : '#f87171'} icon={TrendingUp}
/>
<KpiCard
label={t.remakeRate} value={`${fmt2(kpis.remakeRate)}%`} sub={`${kpis.remakes} ${t.remake}`}
color={kpis.remakeRate <= 5 ? '#34d399' : kpis.remakeRate <= 10 ? '#f5b942' : '#f87171'} icon={RefreshCw}
/>
</div>

{/* Quick alerts */}
{(overdueCases > 0 || todayDeliveries > 0 || notifications.length > 0) && (
<div className="grid md:grid-cols-3 gap-3">
{overdueCases > 0 && (
<div onClick={() => setView('flow')} className="glass rounded-xl p-4 cursor-pointer data-card" style={{ borderColor: 'rgba(248, 113, 113, 0.3)' }}>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(248, 113, 113, 0.15)' }}>
<AlertTriangle size={18} color="#f87171" />
</div>
<div>
<div className="text-[11px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)' }}>{t.overdue}</div>
<div className="text-xl font-bold mono" style={{ color: '#f87171' }}>{overdueCases}</div>
</div>
</div>
</div>
)}
{todayDeliveries > 0 && (
<div onClick={() => setView('flow')} className="glass rounded-xl p-4 cursor-pointer data-card" style={{ borderColor: 'rgba(245, 185, 66, 0.3)' }}>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245, 185, 66, 0.15)' }}>
<Calendar size={18} color="#f5b942" />
</div>
<div>
<div className="text-[11px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)' }}>{t.deliveryToday}</div>
<div className="text-xl font-bold mono" style={{ color: '#f5b942' }}>{todayDeliveries}</div>
</div>
</div>
</div>
)}
{notifications.filter(n => n.id.startsWith('stock-')).length > 0 && (
<div onClick={() => setView('inventory')} className="glass rounded-xl p-4 cursor-pointer data-card" style={{ borderColor: 'rgba(167, 139, 250, 0.3)' }}>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(167, 139, 250, 0.15)' }}>
<Package size={18} color="#a78bfa" />
</div>
<div>
<div className="text-[11px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)' }}>{t.lowStock}</div>
<div className="text-xl font-bold mono" style={{ color: '#a78bfa' }}>
{notifications.filter(n => n.id.startsWith('stock-')).length}
</div>
</div>
</div>
</div>
)}
</div>
)}

{/* Production Flow Snapshot */}

  <div className="glass rounded-2xl p-5">
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <div>
        <h3 className="display-font text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <GitBranch size={17} color="#0891b2" />
          {t.productionFlow}
        </h3>
        <p className="text-[11.5px]" style={{ color: 'var(--text-3)' }}>{t.flowDescription}</p>
      </div>
      <button onClick={() => setView('flow')} className="btn btn-ghost">
        <ArrowRight size={13} />
        {lang === 'ar' ? 'عرض المخطط الكامل' : 'View full flow'}
      </button>
    </div>

<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
  {ROOMS.map((room, idx) => {
    const count = casesPerRoom[room.id];
    const RoomIcon = room.icon;
    return (
      <div
        key={room.id}
        onClick={() => setView('flow')}
        className="rounded-xl p-3 cursor-pointer data-card relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${room.color}10, ${room.color}05)`,
          border: `1px solid ${room.color}25`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${room.color}20` }}>
            <RoomIcon size={13} color={room.color} />
          </div>
          <span className="mono text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>{room.num}</span>
        </div>
        <div className="text-[10px] uppercase font-bold tracking-wider truncate" style={{ color: 'var(--text-2)' }}>
          {lang === 'ar' ? room.ar : room.en}
        </div>
        <div className="mono text-2xl font-bold mt-1" style={{ color: room.color }}>{count}</div>
      </div>
    );
  })}
</div>

  </div>

{/* Recent cases */}

  <div className="glass rounded-2xl p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="display-font text-lg font-semibold" style={{ color: 'var(--text)' }}>
        {t.recentActivity}
      </h3>
      <button onClick={() => setView('cases')} className="btn btn-ghost">
        <ArrowRight size={13} />
        {lang === 'ar' ? 'كل الحالات' : 'All cases'}
      </button>
    </div>
    <div className="space-y-2">
      {state.cases.slice(-5).reverse().map(c => {
        const room = ROOM_MAP[c.currentRoom];
        const daysLeft = daysUntil(c.deadline);
        const isOverdue = daysLeft !== null && daysLeft < 0;
        return (
          <div key={c.id} onClick={() => setSelectedCase(c)} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:brightness-125" style={{ background: 'rgba(120, 180, 255, 0.03)', border: '1px solid rgba(120, 180, 255, 0.06)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${room.color}18`, border: `1px solid ${room.color}30` }}>
              <room.icon size={14} color={room.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold truncate" style={{ color: 'var(--text)' }}>{c.patient}</div>
              <div className="mono text-[10.5px]" style={{ color: 'var(--text-3)' }}>{c.caseId} · {c.clinic}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: room.color }}>
                {lang === 'ar' ? room.ar : room.en}
              </div>
              <div className="text-[10.5px] mono" style={{ color: isOverdue ? '#f87171' : 'var(--text-3)' }}>
                {daysLeft !== null ? (isOverdue ? `${Math.abs(daysLeft)} ${lang === 'ar' ? 'يوم متأخر' : 'd overdue'}` : `${daysLeft} ${t.days}`) : '—'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</div>

{/* Case Intake Modal - opens when user clicks "Add New Case" */}
{showIntakeModal && <CaseIntakeModal ctx={ctx} onClose={() => setShowIntakeModal(false)} onSave={handleSaveCase} />}
{selectedCase && <CaseDetailModal caseData={selectedCase} ctx={ctx} onClose={() => setSelectedCase(null)} />}
</>
);
}

function KpiCard({ label, value, sub, color, icon: Icon, trend }) {
return (

<div className="glass rounded-2xl p-4 data-card fade-up relative overflow-hidden">
<div
className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10"
style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
/>
<div className="flex items-center gap-2 mb-2">
<div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
<Icon size={13} color={color} />
</div>
<div className="text-[10.5px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>
{label}
</div>
</div>
<div className="display-font text-2xl font-semibold mono" style={{ color: 'var(--text)' }}>{value}</div>
<div className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>{sub}</div>
</div>
);
}

// ═══════════════════════════════════════════════════════════════════════
//  PRODUCTION FLOW VIEW (room-based kanban)
// ═══════════════════════════════════════════════════════════════════════
function ProductionFlowView({ ctx, setView }) {
const { state, t, lang, isRtl, moveCaseToRoom, getName, showToast } = ctx;
const [selectedCase, setSelectedCase] = useState(null);
const [filterRoom, setFilterRoom] = useState('all');

const activeCases = useMemo(() => state.cases.filter(c => c.status !== 'delivered'), [state.cases]);

const casesByRoom = useMemo(() => {
const map = {};
ROOMS.forEach(r => { map[r.id] = []; });
activeCases.forEach(c => {
if (map[c.currentRoom]) map[c.currentRoom].push(c);
});
return map;
}, [activeCases]);

const visibleRooms = filterRoom === 'all' ? ROOMS : ROOMS.filter(r => r.id === filterRoom);

// Cases that have sat in their current room longer than 1.5× its SLA.
const stuckCases = useMemo(() => {
return activeCases
.map(c => {
const last = c.roomHistory && c.roomHistory.length ? c.roomHistory[c.roomHistory.length - 1] : null;
const hrs = last ? hoursIn(last.at) : 0;
const sla = ROOM_SLA_HOURS[c.currentRoom] || 12;
return { c, hrs, sla, over: hrs > sla * 1.5 };
})
.filter(x => x.over)
.sort((a, b) => (b.hrs / b.sla) - (a.hrs / a.sla));
}, [activeCases]);

return (

<div className="space-y-5">
{/* Header stats */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
<MiniStat label={t.activeCases} value={activeCases.length} subLabel={lang === 'ar' ? 'قيد التنفيذ' : 'in progress'} color="#0891b2" icon={Activity} />
<MiniStat
label={t.overdue}
value={activeCases.filter(c => { const d = daysUntil(c.deadline); return d !== null && d < 0; }).length}
subLabel={lang === 'ar' ? 'متأخرة' : 'cases'}
color="#f87171" icon={AlertTriangle}
/>
<MiniStat
label={t.urgent}
value={activeCases.filter(c => { const d = daysUntil(c.deadline); return d !== null && d >= 0 && d <= 1; }).length}
subLabel={lang === 'ar' ? 'خلال 24س' : 'within 24h'}
color="#f5b942" icon={Hourglass}
/>
<MiniStat
label={t.deliveryToday}
value={activeCases.filter(c => c.deadline === new Date().toISOString().split('T')[0]).length}
subLabel={lang === 'ar' ? 'جدول اليوم' : "today's queue"}
color="#34d399" icon={Calendar}
/>
</div>

{/* Room filter chips */}

  <div className="glass rounded-2xl p-3 flex items-center gap-2 overflow-x-auto scroll-y">
    <button
      onClick={() => setFilterRoom('all')}
      className={`tab-btn ${filterRoom === 'all' ? 'active' : ''} whitespace-nowrap`}
    >
      {lang === 'ar' ? 'كل الغرف' : 'All Rooms'}
      <span className="mono ml-1 text-[10px] opacity-60">{activeCases.length}</span>
    </button>
    {ROOMS.map(r => (
      <button
        key={r.id}
        onClick={() => setFilterRoom(r.id)}
        className={`tab-btn ${filterRoom === r.id ? 'active' : ''} whitespace-nowrap flex items-center gap-1.5`}
      >
        <r.icon size={12} color={r.color} />
        {lang === 'ar' ? r.ar : r.en}
        <span className="mono text-[10px] opacity-60">{casesByRoom[r.id].length}</span>
      </button>
    ))}
    <button
      onClick={() => { if (activeCases.length) printBatchLabels(activeCases, lang); else showToast('warning', t.noCases); }}
      className="btn btn-ghost whitespace-nowrap ml-auto shrink-0"
      title={lang === 'ar' ? 'طباعة ملصقات QR لكل الحالات' : 'Print QR labels for all cases'}
    >
      <QrCode size={13} /> {lang === 'ar' ? 'طباعة الملصقات' : 'Print Labels'}
    </button>
  </div>

{/* Stuck cases banner */}
{stuckCases.length > 0 && (
  <div className="glass rounded-2xl p-4" style={{ borderColor: 'rgba(245, 185, 66, 0.3)', background: 'rgba(245, 185, 66, 0.04)' }}>
    <div className="flex items-center gap-2 mb-2">
      <Hourglass size={15} color="#f5b942" />
      <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>
        {lang === 'ar' ? 'حالات متوقفة' : 'Stuck Cases'} ({stuckCases.length})
      </span>
      <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
        {lang === 'ar' ? 'تجاوزت الوقت المتوقع في غرفتها' : 'exceeded expected time in room'}
      </span>
    </div>
    <div className="flex flex-wrap gap-2">
      {stuckCases.slice(0, 8).map(({ c, hrs }) => (
        <button
          key={c.id}
          onClick={() => setSelectedCase(c)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px]"
          style={{ background: 'rgba(245, 185, 66, 0.1)', border: '1px solid rgba(245, 185, 66, 0.25)' }}
        >
          <span className="mono font-bold" style={{ color: '#f5b942' }}>{c.caseId}</span>
          <span style={{ color: 'var(--text-2)' }}>{lang === 'ar' ? ROOM_MAP[c.currentRoom]?.ar : ROOM_MAP[c.currentRoom]?.en}</span>
          <span className="mono" style={{ color: 'var(--text-3)' }}>{Math.round(hrs)}{t.hours}</span>
        </button>
      ))}
    </div>
  </div>
)}

{/* Rooms board */}

  <div className={`grid gap-3 ${filterRoom === 'all' ? 'md:grid-cols-2 xl:grid-cols-4' : 'grid-cols-1'}`}>
    {visibleRooms.map((room, idx) => {
      const cases = casesByRoom[room.id];
      const RoomIcon = room.icon;
      return (
        <div
          key={room.id}
          className="glass rounded-2xl overflow-hidden flex flex-col"
          style={{ borderTop: `3px solid ${room.color}`, minHeight: 200 }}
        >
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: `${room.color}08`, borderBottom: '1px solid rgba(120, 180, 255, 0.08)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${room.color}20` }}>
                <RoomIcon size={14} color={room.color} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="mono text-[10px] font-bold" style={{ color: 'var(--text-3)' }}>{room.num}</span>
                  <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>
                    {lang === 'ar' ? room.ar : room.en}
                  </span>
                </div>
                <div className="text-[10.5px]" style={{ color: 'var(--text-3)' }}>
                  {cases.length} {t.casesInRoom}
                </div>
              </div>
            </div>
            <div
              className="mono text-xl font-bold px-2 py-0.5 rounded-lg"
              style={{ background: `${room.color}15`, color: room.color }}
            >
              {cases.length}
            </div>
          </div>

      <div className="p-3 space-y-2 scroll-y flex-1" style={{ maxHeight: 480 }}>
        {cases.length === 0 ? (
          <div className="text-center py-8 text-[12px]" style={{ color: 'var(--text-3)' }}>
            <CircleDot size={20} className="mx-auto mb-1 opacity-30" />
            {t.noCases}
          </div>
        ) : cases.map(c => {
          const last = c.roomHistory && c.roomHistory.length ? c.roomHistory[c.roomHistory.length - 1] : null;
          const hrs = last ? hoursIn(last.at) : 0;
          const sla = ROOM_SLA_HOURS[c.currentRoom] || 12;
          const stuck = hrs > sla * 1.5;
          const left = daysUntil(c.deadline);
          const overdue = left !== null && left < 0;
          const urgent = left !== null && left >= 0 && left <= 1;
          return (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className="rounded-lg p-3 cursor-pointer transition-all hover:translate-y-[-1px]"
              style={{
                background: 'rgba(241, 245, 249, 0.7)',
                border: `1px solid ${overdue ? 'rgba(248, 113, 113, 0.35)' : urgent ? 'rgba(245, 185, 66, 0.3)' : stuck ? 'rgba(245, 185, 66, 0.2)' : 'rgba(120, 180, 255, 0.1)'}`,
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="mono text-[10.5px] font-semibold" style={{ color: 'var(--text-3)' }}>{c.caseId}</div>
                  <div className="text-[12.5px] font-bold truncate" style={{ color: 'var(--text)' }}>{c.patient}</div>
                  <div className="text-[10.5px] truncate" style={{ color: 'var(--text-2)' }}>{c.clinic}</div>
                </div>
                {(overdue || urgent) && (
                  <div className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{
                    background: overdue ? 'rgba(248, 113, 113, 0.15)' : 'rgba(245, 185, 66, 0.15)',
                    color: overdue ? '#f87171' : '#f5b942'
                  }}>
                    {overdue ? t.overdue : t.urgent}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 text-[10.5px]">
                <div className="flex items-center gap-1" style={{ color: stuck ? '#f5b942' : 'var(--text-3)' }}>
                  <Clock size={10} />
                  <span className="mono">{timeSince(last?.at, lang)}</span>
                </div>
                <div className="flex-1" />
                <div className="mono" style={{ color: overdue ? '#f87171' : 'var(--text-3)' }}>
                  {left !== null ? (overdue ? `${Math.abs(left)}d ${lang === 'ar' ? 'متأخر' : 'late'}` : `${left}d`) : '—'}
                </div>
              </div>

              <div className="flex gap-1 mt-2 pt-2 border-t" style={{ borderColor: 'rgba(120, 180, 255, 0.06)' }}>
                {prevRoomId(c.currentRoom) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const prev = prevRoomId(c.currentRoom);
                      moveCaseToRoom(c.id, prev, lang === 'ar' ? 'يدوي' : 'Manual');
                      showToast('success', `${c.caseId} → ${lang === 'ar' ? ROOM_MAP[prev].ar : ROOM_MAP[prev].en}`);
                    }}
                    className="w-7 h-7 rounded flex items-center justify-center"
                    style={{ background: 'rgba(120, 180, 255, 0.08)', border: '1px solid rgba(120, 180, 255, 0.12)' }}
                    title={t.moveBack}
                  >
                    <ChevronRight size={12} color="#94a3c4" style={{ transform: isRtl ? 'none' : 'scaleX(-1)' }} />
                  </button>
                )}
                {nextRoomId(c.currentRoom) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = nextRoomId(c.currentRoom);
                      moveCaseToRoom(c.id, next, lang === 'ar' ? 'يدوي' : 'Manual');
                      showToast('success', `${c.caseId} → ${lang === 'ar' ? ROOM_MAP[next].ar : ROOM_MAP[next].en}`);
                    }}
                    className="flex-1 h-7 rounded flex items-center justify-center gap-1 text-[11px] font-semibold"
                    style={{ background: `${room.color}18`, border: `1px solid ${room.color}40`, color: room.color }}
                  >
                    {t.moveNext}
                    <ChevronRight size={11} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCase(c);
                  }}
                  className="w-7 h-7 rounded flex items-center justify-center"
                  style={{ background: 'rgba(167, 139, 250, 0.08)', border: '1px solid rgba(167, 139, 250, 0.2)' }}
                  title={t.showQr}
                >
                  <QrCode size={11} color="#a78bfa" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
})}

  </div>

{/* Case detail modal */}
{selectedCase && (
<CaseDetailModal
caseData={selectedCase}
ctx={ctx}
onClose={() => setSelectedCase(null)}
/>
)}

</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  LOCAL QR CODE GENERATOR (offline, no external API) — Nayuki algorithm (MIT)
// ═══════════════════════════════════════════════════════════════════════
function _qrEccBlock(ecl, ver) {
  const ECC = [
    [-1,7,10,13,17,10,16,22,28,18,26,34,46,32,42,48,56,68,72,80,90,108,114,116,124,134,144,150,164,176,194,204,216,228,240,252,260,288,304,316,328],
    [-1,10,16,22,28,24,30,42,42,52,42,58,68,52,68,84,90,108,108,130,138,142,150,156,174,176,180,180,180,180,180,180,180,180,180,180,180,180,180,180,180],
  ];
  return ECC[ecl][ver];
}
function _qrNumBlocks(ecl, ver) {
  const NB = [
    [-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],
    [-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],
  ];
  return NB[ecl][ver];
}
function _qrRawDataModules(ver) {
  let r = (16 * ver + 128) * ver + 64;
  if (ver >= 2) { const na = Math.floor(ver / 7) + 2; r -= (25 * na - 10) * na - 55; if (ver >= 7) r -= 36; }
  return r;
}
function _qrNumDataCodewords(ver, ecl) {
  return Math.floor(_qrRawDataModules(ver) / 8) - _qrEccBlock(ecl, ver) * _qrNumBlocks(ecl, ver);
}
function _qrRsMul(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
  return z & 0xFF;
}
function _qrRsDivisor(degree) {
  const result = []; for (let i = 0; i < degree - 1; i++) result.push(0); result.push(1);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) { result[j] = _qrRsMul(result[j], root); if (j + 1 < result.length) result[j] ^= result[j + 1]; }
    root = _qrRsMul(root, 0x02);
  }
  return result;
}
function _qrRsRemainder(data, divisor) {
  const result = divisor.map(() => 0);
  data.forEach(b => {
    const factor = b ^ result.shift(); result.push(0);
    divisor.forEach((coef, i) => { result[i] ^= _qrRsMul(coef, factor); });
  });
  return result;
}
// Returns a 2D boolean array (true = dark module). ecl: 0=L,1=M (we use M).
function qrModules(text, ecl = 1) {
  const utf8 = unescape(encodeURIComponent(text));
  const data = []; for (let i = 0; i < utf8.length; i++) data.push(utf8.charCodeAt(i));

  let ver;
  for (ver = 1; ver <= 40; ver++) {
    const cap = _qrNumDataCodewords(ver, ecl) * 8;
    const cc = ver <= 9 ? 8 : 16;
    if (4 + cc + data.length * 8 <= cap) break;
  }
  if (ver > 40) ver = 40;

  const bb = [];
  const appendBits = (val, len) => { for (let i = len - 1; i >= 0; i--) bb.push((val >>> i) & 1); };
  appendBits(0x4, 4);
  appendBits(data.length, ver <= 9 ? 8 : 16);
  for (let i = 0; i < data.length; i++) appendBits(data[i], 8);
  const cap = _qrNumDataCodewords(ver, ecl) * 8;
  appendBits(0, Math.min(4, cap - bb.length));
  appendBits(0, (8 - bb.length % 8) % 8);
  for (let pad = 0xEC; bb.length < cap; pad ^= 0xEC ^ 0x11) appendBits(pad, 8);

  const dataCw = [];
  for (let i = 0; i < bb.length; i += 8) { let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bb[i + j]; dataCw.push(b); }

  // ECC + interleave
  const numBlocks = _qrNumBlocks(ecl, ver), blockEcc = _qrEccBlock(ecl, ver);
  const rawCw = Math.floor(_qrRawDataModules(ver) / 8);
  const numShort = numBlocks - rawCw % numBlocks, shortLen = Math.floor(rawCw / numBlocks);
  const blocks = []; const rsDiv = _qrRsDivisor(blockEcc);
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = dataCw.slice(k, k + shortLen - blockEcc + (i < numShort ? 0 : 1)); k += dat.length;
    const ecc = _qrRsRemainder(dat, rsDiv);
    if (i < numShort) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const allCw = [];
  for (let i = 0; i < blocks[0].length; i++)
    for (let j = 0; j < blocks.length; j++)
      if (i != shortLen - blockEcc || j >= numShort) allCw.push(blocks[j][i]);

  const size = ver * 4 + 17;
  const mods = [], fn = [];
  for (let i = 0; i < size; i++) { mods.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
  const setF = (x, y, v) => { mods[y][x] = v; fn[y][x] = true; };

  // Timing
  for (let i = 0; i < size; i++) { setF(6, i, i % 2 == 0); setF(i, 6, i % 2 == 0); }
  // Finder
  const finder = (x, y) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const dist = Math.max(Math.abs(dx), Math.abs(dy)), xx = x + dx, yy = y + dy;
      if (xx >= 0 && xx < size && yy >= 0 && yy < size) setF(xx, yy, dist != 2 && dist != 4);
    }
  };
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
  // Alignment
  const alignPos = (() => {
    if (ver == 1) return [];
    const na = Math.floor(ver / 7) + 2;
    const step = ver == 32 ? 26 : Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2;
    const res = [6];
    for (let pos = size - 7; res.length < na; pos -= step) res.splice(1, 0, pos);
    return res;
  })();
  for (let i = 0; i < alignPos.length; i++) for (let j = 0; j < alignPos.length; j++) {
    if (!(i == 0 && j == 0 || i == 0 && j == alignPos.length - 1 || i == alignPos.length - 1 && j == 0)) {
      const x = alignPos[i], y = alignPos[j];
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++)
        setF(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
    }
  }
  // Format bits (reserve, drawn properly after mask)
  const drawFormat = (msk) => {
    const d = ecl << 3 | msk; let rem = d;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = (d << 10 | rem) ^ 0x5412;
    for (let i = 0; i <= 5; i++) setF(8, i, ((bits >>> i) & 1) != 0);
    setF(8, 7, ((bits >>> 6) & 1) != 0); setF(8, 8, ((bits >>> 7) & 1) != 0); setF(7, 8, ((bits >>> 8) & 1) != 0);
    for (let i = 9; i < 15; i++) setF(14 - i, 8, ((bits >>> i) & 1) != 0);
    for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, ((bits >>> i) & 1) != 0);
    for (let i = 8; i < 15; i++) setF(8, size - 15 + i, ((bits >>> i) & 1) != 0);
    setF(8, size - 8, true);
  };
  drawFormat(0);
  // Version info
  if (ver >= 7) {
    let rem = ver; for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
    const bits = ver << 12 | rem;
    for (let i = 0; i < 18; i++) { const bit = ((bits >>> i) & 1) != 0; const a = size - 11 + i % 3, b = Math.floor(i / 3); setF(a, b, bit); setF(b, a, bit); }
  }
  // Draw codewords
  let bi = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right == 6) right = 5;
    for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
      const x = right - j, upward = ((right + 1) & 2) == 0, y = upward ? size - 1 - vert : vert;
      if (!fn[y][x] && bi < allCw.length * 8) { mods[y][x] = ((allCw[bi >>> 3] >>> (7 - (bi & 7))) & 1) != 0; bi++; }
    }
  }
  // Mask selection
  const maskFn = (m, x, y) => {
    switch (m) {
      case 0: return (x + y) % 2 == 0; case 1: return y % 2 == 0; case 2: return x % 3 == 0;
      case 3: return (x + y) % 3 == 0; case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0;
      case 5: return x * y % 2 + x * y % 3 == 0; case 6: return (x * y % 2 + x * y % 3) % 2 == 0;
      case 7: return ((x + y) % 2 + x * y % 3) % 2 == 0;
    }
  };
  const applyMask = (m) => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && maskFn(m, x, y)) mods[y][x] = !mods[y][x]; };
  const penalty = () => {
    let p = 0;
    for (let y = 0; y < size; y++) { let rc = false, rl = 0; for (let x = 0; x < size; x++) { if (mods[y][x] == rc) { rl++; if (rl == 5) p += 3; else if (rl > 5) p++; } else { rc = mods[y][x]; rl = 1; } } }
    for (let x = 0; x < size; x++) { let rc = false, rl = 0; for (let y = 0; y < size; y++) { if (mods[y][x] == rc) { rl++; if (rl == 5) p += 3; else if (rl > 5) p++; } else { rc = mods[y][x]; rl = 1; } } }
    for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) { const c = mods[y][x]; if (c == mods[y][x+1] && c == mods[y+1][x] && c == mods[y+1][x+1]) p += 3; }
    let dark = 0; mods.forEach(r => r.forEach(v => { if (v) dark++; })); const total = size * size;
    p += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
    return p;
  };
  let bestMask = 0, minP = Infinity;
  for (let m = 0; m < 8; m++) { applyMask(m); drawFormat(m); const pen = penalty(); if (pen < minP) { minP = pen; bestMask = m; } applyMask(m); }
  applyMask(bestMask); drawFormat(bestMask);
  return mods;
}

// React SVG QR component — renders locally, scannable, works offline & in print
function QRCodeSVG({ value, size = 192, className = '', light = '#ffffff', dark = '#000000' }) {
  const mods = useMemo(() => { try { return qrModules(String(value || ' '), 1); } catch (e) { return null; } }, [value]);
  if (!mods) return null;
  const n = mods.length, quiet = 4, dim = n + quiet * 2;
  let path = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (mods[y][x]) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
  return (
    <svg className={className} width={size} height={size} viewBox={`0 0 ${dim} ${dim}`} shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect width={dim} height={dim} fill={light} />
      <path d={path} fill={dark} />
    </svg>
  );
}

// Returns a standalone SVG string for embedding into print windows
function qrSvgString(value, px = 220) {
  let mods; try { mods = qrModules(String(value || ' '), 1); } catch (e) { return ''; }
  const n = mods.length, quiet = 4, dim = n + quiet * 2;
  let path = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (mods[y][x]) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
  return `<svg width="${px}" height="${px}" viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect width="${dim}" height="${dim}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
}

// Print a sheet of QR labels for many cases at once (one scannable label each).
function printBatchLabels(cases, lang) {
  const w = window.open('', '_blank');
  if (!w) return;
  const matName = (type) => ({
    zirconia: 'Zirconia', emax: 'E-max', emaxCad: 'E-max CAD', pmma: 'PMMA',
    acrylic: 'Acrylic', implant: 'Implant', veneer: 'Veneer', denture: 'Denture',
    ortho: 'Ortho', cadcam: 'CAD/CAM',
  }[type] || type || '—');
  const roomName = (id) => (ROOM_MAP[id] ? (lang === 'ar' ? ROOM_MAP[id].ar : ROOM_MAP[id].en) : '—');
  const cards = cases.map(c => `
    <div class="label">
      <div class="qr">${qrSvgString(c.caseId, 150)}</div>
      <div class="info">
        <div class="cid">${c.caseId}</div>
        <div class="pt">${c.patient || ''}</div>
        <div class="meta">${matName(c.type)}${c.units ? ' · ' + c.units + 'u' : ''}</div>
        <div class="meta">${roomName(c.currentRoom)}</div>
      </div>
    </div>`).join('');
  w.document.write(`<!DOCTYPE html>
<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
<head><meta charset="UTF-8" /><title>QR Labels</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: ${lang === 'ar' ? '"Tajawal", system-ui, sans-serif' : '"Manrope", system-ui, sans-serif'}; margin: 0; padding: 12px; background: #fff; color: #000; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .label { border: 1px solid #000; border-radius: 6px; padding: 8px; display: flex; gap: 8px; align-items: center; break-inside: avoid; }
  .qr svg { width: 80px; height: 80px; }
  .info { min-width: 0; }
  .cid { font-family: monospace; font-weight: 700; font-size: 13px; }
  .pt { font-size: 12px; font-weight: 600; }
  .meta { font-size: 10px; color: #444; }
  @media print { @page { size: A4; margin: 10mm; } }
</style></head>
<body><div class="grid">${cards}</div>
<script>setTimeout(() => window.print(), 500);</script>
</body></html>`);
  w.document.close();
}


// ═══════════════════════════════════════════════════════════════════════
//  CASE DETAIL MODAL (with QR code)
// ═══════════════════════════════════════════════════════════════════════
function CaseDetailModal({ caseData, ctx, onClose }) {
const { t, lang, isRtl, moveCaseToRoom, showToast } = ctx;
const c = caseData;
const room = ROOM_MAP[c.currentRoom];
const left = daysUntil(c.deadline);
const overdue = left !== null && left < 0;

// QR code generated locally (offline, no external API) as inline SVG
const qrSvgInline = qrSvgString(c.caseId, 220);

// Material display (handle both old and new format) — component-level so JSX + printLabel both see it
const materialName = {
zirconia: 'Zirconia', emax: 'E-max', emaxCad: 'E-max CAD',
pmma: 'PMMA', acrylic: 'Acrylic', implant: 'Implant',
veneer: 'Veneer', denture: 'Denture', ortho: 'Ortho', cadcam: 'CAD/CAM'
}[c.type] || c.type || '—';

const printLabel = () => {
const w = window.open('', '_blank');
if (!w) return;

// Build the FDI tooth chart HTML with selected teeth highlighted
const teeth = c.teeth || [];
const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerRight = [41, 42, 43, 44, 45, 46, 47, 48];
const lowerLeft = [38, 37, 36, 35, 34, 33, 32, 31];

const renderTooth = (n) => {
const selected = teeth.includes(n);
return `<div class="tooth ${selected ? 'sel' : ''}">${n}</div>`;
};

const renderRow = (arr) => arr.map(renderTooth).join('');

// Helper for checkbox in print
const cb = (checked) => checked ? '☑' : '☐';

// Type of work
const typeOfWork = c.typeOfWork || (c.type === 'implant' ? 'implant' : 'crown');

// Checklist data
const checklist = c.checklist || {};
const missing = c.missing || {};
const implantData = c.implantData || {};

// Date formatting
const dateStr = c.date || new Date().toISOString().split('T')[0];

w.document.write(`<!DOCTYPE html>

<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
<head>
<meta charset="UTF-8" />
<title>Lab Script - ${c.caseId}</title>
<style>
* { box-sizing: border-box; }
body {
font-family: ${lang === 'ar' ? '"Tajawal", system-ui, sans-serif' : '"Manrope", system-ui, sans-serif'};
margin: 0; padding: 20px; background: #fff; color: #000;
}
.page { max-width: 800px; margin: 0 auto; padding: 24px; border: 2px solid #000; }
.brand { text-align: center; padding-bottom: 10px; border-bottom: 2px solid #000; margin-bottom: 14px; }
.brand h1 { margin: 0; font-size: 18px; letter-spacing: 0.5px; }
.brand .sub { font-size: 12px; color: #444; margin-top: 4px; }
h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 14px 0 8px; padding: 4px 8px; background: #000; color: #fff; }
.row { display: flex; gap: 14px; margin-bottom: 8px; }
.col { flex: 1; }
.field { padding: 6px 10px; border: 1px solid #999; border-radius: 4px; font-size: 12px; }
.field .lbl { font-size: 9px; text-transform: uppercase; color: #666; letter-spacing: 1px; margin-bottom: 2px; }
.field .val { font-weight: 600; font-size: 13px; min-height: 16px; }
.opt-group { display: flex; gap: 12px; flex-wrap: wrap; padding: 8px; border: 1px dashed #999; border-radius: 4px; }
.opt { font-size: 12px; }
.opt.active { font-weight: 700; }
.checklist { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; }
.check-item { font-size: 11.5px; padding: 3px 0; }
.tooth-section { padding: 10px; border: 1px solid #999; border-radius: 4px; margin: 6px 0; }
.tooth-label { font-size: 10px; text-transform: uppercase; text-align: center; color: #666; margin: 2px 0; letter-spacing: 1px; }
.tooth-row { display: flex; justify-content: center; align-items: center; gap: 4px; padding: 4px 0; }
.tooth { width: 26px; height: 32px; border: 1px solid #666; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 10px; font-weight: 600; }
.tooth.sel { background: #000; color: #fff; border-color: #000; font-weight: 700; }
.tooth-divider { width: 1px; height: 24px; background: #999; margin: 0 4px; }
.status-row { display: flex; gap: 12px; margin: 8px 0; }
.status-box { flex: 1; padding: 8px; border: 2px solid #999; border-radius: 4px; text-align: center; font-weight: 700; font-size: 12px; }
.status-box.active { border-color: #000; background: #000; color: #fff; }
.qr-section { margin-top: 30px; padding-top: 20px; border-top: 2px solid #000; text-align: center; }
.qr-section img { width: 140px; height: 140px; }
.qr-section .id { font-family: monospace; font-size: 16px; font-weight: 700; margin-top: 8px; letter-spacing: 1.5px; }
.signature-block { margin-top: 16px; padding-top: 12px; border-top: 1px solid #999; display: flex; gap: 20px; font-size: 11px; }
.signature-block .sig-item { flex: 1; }
.signature-block .sig-line { border-bottom: 1px solid #000; min-height: 20px; padding: 2px 4px; font-weight: 600; }
.notes-box { min-height: 50px; border: 1px solid #999; border-radius: 4px; padding: 8px; font-size: 12px; }
.footer-mini { text-align: center; font-size: 10px; color: #666; margin-top: 12px; padding-top: 8px; border-top: 1px dashed #999; }
@media print {
body { padding: 0; }
.page { border: 1px solid #000; }
@page { size: A4; margin: 10mm; }
}
</style>
</head>
<body>
<div class="page">
<div class="brand">
<h1>${lang === 'ar' ? 'مختبر الأسنان - أمر عمل داخلي' : 'DENTAL LABORATORY - INTERNAL WORK ORDER'}</h1>
<div class="sub">Evora Dental Lab · ${new Date().toLocaleDateString()}</div>
</div>

<!-- BASIC INFO -->

<h2>${lang === 'ar' ? 'معلومات الحالة' : 'Case Information'}</h2>
<div class="row">
<div class="col"><div class="field"><div class="lbl">${lang === 'ar' ? 'الطبيب' : 'Doctor'}</div><div class="val">${c.doctorName || c.clinic || '—'}</div></div></div>
<div class="col"><div class="field"><div class="lbl">${lang === 'ar' ? 'التاريخ' : 'Date'}</div><div class="val">${dateStr}</div></div></div>
<div class="col"><div class="field"><div class="lbl">${lang === 'ar' ? 'رقم الحالة' : 'Case Number'}</div><div class="val">${c.caseId}</div></div></div>
</div>
<div class="row">
<div class="col"><div class="field"><div class="lbl">${lang === 'ar' ? 'اسم المريض' : 'Patient Name'}</div><div class="val">${c.patient || '—'}</div></div></div>
<div class="col"><div class="field"><div class="lbl">${lang === 'ar' ? 'الشيد' : 'Shade'}</div><div class="val">${c.shade || '—'}</div></div></div>
<div class="col"><div class="field"><div class="lbl">${lang === 'ar' ? 'العيادة' : 'Clinic'}</div><div class="val">${c.clinic || '—'}</div></div></div>
</div>

<!-- MATERIAL -->

<h2>${lang === 'ar' ? 'المادة' : 'Material'}</h2>
<div class="opt-group">
${['zirconia', 'emax', 'emaxCad', 'pmma', 'acrylic'].map(m => {
const labels = { zirconia: 'Zirconia', emax: 'E-max', emaxCad: 'E-max CAD', pmma: 'PMMA', acrylic: 'Acrylic' };
const active = c.type === m;
return `<div class="opt ${active ? 'active' : ''}">${active ? '☑' : '☐'} ${labels[m]}</div>`;
}).join('')}
</div>

<!-- TYPE OF WORK -->

<h2>${lang === 'ar' ? 'نوع العمل' : 'Type of Work'}</h2>
<div class="opt-group">
${['crown', 'bridge', 'implant', 'other'].map(t => {
const labels = { crown: lang === 'ar' ? 'تاج' : 'Crown', bridge: lang === 'ar' ? 'جسر' : 'Bridge', implant: lang === 'ar' ? 'زراعة' : 'Implant', other: lang === 'ar' ? 'أخرى' : 'Other' };
const active = typeOfWork === t;
return `<div class="opt ${active ? 'active' : ''}">${active ? '☑' : '☐'} ${labels[t]}</div>`;
}).join('')}
</div>

<!-- IMPLANT (if applicable) -->

${typeOfWork === 'implant' ? `

<h2>${lang === 'ar' ? 'تفاصيل الزراعة' : 'Implant Details'}</h2>
<div class="opt-group">
<div class="opt ${implantData.type === 'single' ? 'active' : ''}">${cb(implantData.type === 'single')} ${lang === 'ar' ? 'فردية' : 'Single'}</div>
<div class="opt ${implantData.type === 'bridge' ? 'active' : ''}">${cb(implantData.type === 'bridge')} ${lang === 'ar' ? 'جسر' : 'Bridge'}</div>
<div class="opt ${implantData.type === 'fullArch' ? 'active' : ''}">${cb(implantData.type === 'fullArch')} ${lang === 'ar' ? 'قوس كامل' : 'Full Arch'}</div>
<div style="border-${lang === 'ar' ? 'right' : 'left'}: 1px solid #999; padding-${lang === 'ar' ? 'right' : 'left'}: 12px; margin-${lang === 'ar' ? 'right' : 'left'}: 8px;">
<div class="opt ${implantData.retention === 'screw' ? 'active' : ''}">${cb(implantData.retention === 'screw')} ${lang === 'ar' ? 'محمول على البرغي' : 'Screw-retained'}</div>
<div class="opt ${implantData.retention === 'cement' ? 'active' : ''}">${cb(implantData.retention === 'cement')} ${lang === 'ar' ? 'محمول على الإسمنت' : 'Cement-retained'}</div>
</div>
</div>
` : ''}

<!-- TOOTH CHART -->

<h2>${lang === 'ar' ? 'تحديد الأسنان' : 'Tooth Selection'} ${teeth.length > 0 ? `(${teeth.length})` : ''}</h2>
<div class="tooth-section">
<div class="tooth-label">${lang === 'ar' ? 'الفك العلوي' : 'Upper Jaw'}</div>
<div class="tooth-row">
${renderRow(upperRight)}
<div class="tooth-divider"></div>
${renderRow(upperLeft)}
</div>
<div class="tooth-row">
${renderRow(lowerRight)}
<div class="tooth-divider"></div>
${renderRow(lowerLeft)}
</div>
<div class="tooth-label">${lang === 'ar' ? 'الفك السفلي' : 'Lower Jaw'}</div>
${teeth.length > 0 ? `<div style="text-align:center; margin-top:8px; font-family:monospace; font-size:11px; font-weight:600;">${lang === 'ar' ? 'الأسنان المحددة: ' : 'Selected: '}${teeth.sort((a,b)=>a-b).join(', ')}</div>` : ''}
</div>

<!-- INTAKE STATUS -->

<h2>${lang === 'ar' ? 'حالة الاستقبال (إلزامي)' : 'Case Intake Status (Mandatory)'}</h2>
<div class="status-row">
<div class="status-box ${c.intakeStatus === 'complete' ? 'active' : ''}">${cb(c.intakeStatus === 'complete')} ${lang === 'ar' ? 'مكتملة' : 'CASE COMPLETE'}</div>
<div class="status-box ${c.intakeStatus === 'incomplete' ? 'active' : ''}">${cb(c.intakeStatus === 'incomplete')} ${lang === 'ar' ? 'ناقصة / معلقة' : 'INCOMPLETE / ON HOLD'}</div>
</div>

<!-- REQUIRED INFO -->

<h2>${lang === 'ar' ? 'المعلومات المطلوبة' : 'Required Information'}</h2>
<div class="checklist">
<div class="check-item">${cb(checklist.prescription)} ${lang === 'ar' ? 'وصفة الطبيب' : 'Doctor prescription'}</div>
<div class="check-item">${cb(checklist.impression)} ${lang === 'ar' ? 'الطبعة / المسح' : 'Impression / Scan'}</div>
<div class="check-item">${cb(checklist.bite)} ${lang === 'ar' ? 'تسجيل العض' : 'Bite registration'}</div>
<div class="check-item">${cb(checklist.shade)} ${lang === 'ar' ? 'معلومات الشيد' : 'Shade information'}</div>
<div class="check-item">${cb(checklist.opposing)} ${lang === 'ar' ? 'الفك المقابل' : 'Opposing arch'}</div>
</div>

<!-- MISSING ITEMS -->

${(missing.impression || missing.bite || missing.shade || missing.implant) ? `

<h2 style="background:#c00;">${lang === 'ar' ? 'ناقص' : 'Missing'}</h2>
<div class="checklist">
${missing.impression ? `<div class="check-item">⚠️ ${lang === 'ar' ? 'الطبعة / المسح' : 'Impression / Scan'}</div>` : ''}
${missing.bite ? `<div class="check-item">⚠️ ${lang === 'ar' ? 'تسجيل العض' : 'Bite'}</div>` : ''}
${missing.shade ? `<div class="check-item">⚠️ ${lang === 'ar' ? 'الشيد' : 'Shade'}</div>` : ''}
${missing.implant ? `<div class="check-item">⚠️ ${lang === 'ar' ? 'معلومات الزراعة' : 'Implant Info'}</div>` : ''}
</div>` : ''}

<!-- IMPLANT COMPONENTS (if applicable) -->

${typeOfWork === 'implant' ? `

<h2>${lang === 'ar' ? 'مكونات الزراعة' : 'Implant Components'}</h2>
<div class="checklist">
<div class="check-item">${cb(implantData.systemSpec)} ${lang === 'ar' ? 'نظام الزراعة محدد' : 'Implant system specified'}</div>
<div class="check-item">${cb(implantData.posClear)} ${lang === 'ar' ? 'موقع الزراعة واضح' : 'Implant position clear'}</div>
<div class="check-item">${cb(implantData.impressionCoping)} ${lang === 'ar' ? 'غطاء الانطباع موجود' : 'Impression coping received'}</div>
<div class="check-item">${cb(implantData.analog)} ${lang === 'ar' ? 'المماثل موجود' : 'Analog received'}</div>
<div class="check-item">${cb(implantData.abutment)} ${lang === 'ar' ? 'الدعامة موجودة' : 'Abutment provided'}</div>
<div class="check-item">${cb(implantData.screws)} ${lang === 'ar' ? 'البراغي موجودة' : 'Screws provided'}</div>
<div class="check-item">${cb(implantData.scanbodyType)} ${lang === 'ar' ? 'نوع Scanbody' : 'Scanbody type'}</div>
<div class="check-item">${cb(implantData.scanbodyBrandHeight)} ${lang === 'ar' ? 'ماركة وارتفاع Scanbody' : 'Scanbody brand & height'}</div>
<div class="check-item">${cb(implantData.scanbodyTight)} ${lang === 'ar' ? 'Scanbody مشدود' : 'Scanbody tightened'}</div>
<div class="check-item">${cb(implantData.library)} ${lang === 'ar' ? 'مكتبة الزراعة متوافقة' : 'Implant library compatible'}</div>
<div class="check-item">${cb(implantData.stl)} ${lang === 'ar' ? 'ملفات STL موجودة' : 'STL files received'}</div>
</div>` : ''}

<!-- NOTES -->

${c.notes ? `

<h2>${lang === 'ar' ? 'ملاحظات' : 'Notes'}</h2>
<div class="notes-box">${c.notes}</div>` : ''}

<!-- SIGNATURE -->

<div class="signature-block">
<div class="sig-item">
<div class="lbl" style="font-size:10px; text-transform:uppercase; color:#666; margin-bottom:4px;">${lang === 'ar' ? 'فني الاستقبال' : 'Intake Technician'}</div>
<div class="sig-line">${c.technician || ''}</div>
</div>
<div class="sig-item">
<div class="lbl" style="font-size:10px; text-transform:uppercase; color:#666; margin-bottom:4px;">${lang === 'ar' ? 'التوقيع' : 'Signature'}</div>
<div class="sig-line"></div>
</div>
<div class="sig-item">
<div class="lbl" style="font-size:10px; text-transform:uppercase; color:#666; margin-bottom:4px;">${lang === 'ar' ? 'التاريخ' : 'Date'}</div>
<div class="sig-line">${dateStr}</div>
</div>
</div>

<!-- QR CODE AT BOTTOM CENTER -->

<div class="qr-section">
${qrSvgInline}
<div class="id">${c.caseId}</div>
<div class="footer-mini">${lang === 'ar' ? 'امسح للتتبع' : 'Scan for tracking'} · Evora Dental Lab</div>
</div>
</div>
<script>setTimeout(() => window.print(), 500);</script>
</body>
</html>`);
w.document.close();
};

return (

<div
className="fixed inset-0 z-50 flex items-center justify-center p-4"
style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)' }}
onClick={onClose}
>
<div
className="glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] scroll-y"
style={{ background: 'rgba(255, 255, 255, 0.98)' }}
onClick={e => e.stopPropagation()}
>
{/* Header */}
<div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
<div>
<div className="mono text-[11px] font-bold" style={{ color: 'var(--text-3)' }}>{c.caseId}</div>
<div className="display-font text-xl font-semibold" style={{ color: 'var(--text)' }}>{c.patient}</div>
<div className="text-[12px]" style={{ color: 'var(--text-2)' }}>{c.clinic}</div>
</div>
<button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(120, 180, 255, 0.08)' }}>
<X size={15} color="#94a3c4" />
</button>
</div>

<div className="p-5 grid md:grid-cols-2 gap-5">
  {/* QR Code Side */}
  <div className="space-y-3">
    <div className="rounded-xl p-5 flex flex-col items-center" style={{ background: '#fff' }}>
      <QRCodeSVG value={c.caseId} size={192} />
      <div className="mono text-[12px] font-bold mt-3 text-center" style={{ color: '#000' }}>{c.caseId}</div>
    </div>
    <button onClick={printLabel} className="btn btn-primary w-full justify-center">
      <Printer size={13} />
      {t.printLabel}
    </button>
  </div>

  {/* Info Side */}
  <div className="space-y-3">
    <div>
      <div className="text-[10.5px] uppercase font-bold tracking-widest mb-1.5" style={{ color: 'var(--text-3)' }}>{t.currentRoom}</div>
      <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: `${room.color}15`, border: `1px solid ${room.color}30` }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${room.color}25` }}>
          <room.icon size={15} color={room.color} />
        </div>
        <div>
          <div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>
            {lang === 'ar' ? room.ar : room.en}
          </div>
          <div className="mono text-[10.5px]" style={{ color: 'var(--text-3)' }}>Room {room.num}</div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-lg p-2.5" style={{ background: 'rgba(241, 245, 249, 0.7)' }}>
        <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>{t.units}</div>
        <div className="mono text-base font-bold" style={{ color: 'var(--text)' }}>{c.units}</div>
      </div>
      <div className="rounded-lg p-2.5" style={{ background: 'rgba(241, 245, 249, 0.7)' }}>
        <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>{t.deadline}</div>
        <div className="mono text-base font-bold" style={{ color: overdue ? '#f87171' : 'var(--text)' }}>
          {left !== null ? (overdue ? `${Math.abs(left)}d ${lang === 'ar' ? 'متأخر' : 'late'}` : `${left} ${t.days}`) : '—'}
        </div>
      </div>
    </div>

    {/* Full case details */}
    <div>
      <div className="text-[10.5px] uppercase font-bold tracking-widest mb-1.5" style={{ color: 'var(--text-3)' }}>
        {lang === 'ar' ? 'تفاصيل الحالة' : 'Case Details'}
      </div>
      <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(120, 180, 255, 0.08)' }}>
        {[
          { label: t.type, value: t[c.type] || c.type || '—' },
          { label: t.material, value: materialName },
          { label: t.technician, value: c.technician || '—' },
          { label: t.status, value: t[c.status] || c.status || '—' },
          { label: t.price, value: c.price != null ? `${fmt2(c.price)} ${t.currency}` : '—' },
          { label: lang === 'ar' ? 'التاريخ' : 'Date', value: c.date || '—' },
          { label: t.shade, value: c.shade || '—' },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="text-[11px]" style={{ color: 'var(--text-3)' }}>{row.label}</div>
            <div className="text-[12px] font-bold text-right" style={{ color: 'var(--text)' }}>{row.value}</div>
          </div>
        ))}
        {c.remake && (
          <div className="flex items-center gap-1.5 pt-1">
            <RefreshCw size={11} color="#f87171" />
            <span className="text-[11px] font-bold" style={{ color: '#f87171' }}>{t.remake}</span>
          </div>
        )}
      </div>
    </div>

    {/* FDI teeth */}
    {Array.isArray(c.teeth) && c.teeth.length > 0 && (
      <div>
        <div className="text-[10.5px] uppercase font-bold tracking-widest mb-1.5" style={{ color: 'var(--text-3)' }}>
          {lang === 'ar' ? 'الأسنان (FDI)' : 'Teeth (FDI)'}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {c.teeth.map(n => (
            <span key={n} className="mono text-[11px] font-bold px-2 py-1 rounded-md" style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#0891b2' }}>{n}</span>
          ))}
        </div>
      </div>
    )}

    {/* Notes */}
    {c.notes && (
      <div>
        <div className="text-[10.5px] uppercase font-bold tracking-widest mb-1.5" style={{ color: 'var(--text-3)' }}>
          {t.notesField || (lang === 'ar' ? 'ملاحظات' : 'Notes')}
        </div>
        <div className="rounded-lg p-3 text-[12px]" style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(120, 180, 255, 0.08)', color: 'var(--text-2)' }}>
          {c.notes}
        </div>
      </div>
    )}

    <div className="flex gap-2">
      {prevRoomId(c.currentRoom) && (
        <button
          onClick={() => {
            const prev = prevRoomId(c.currentRoom);
            moveCaseToRoom(c.id, prev, lang === 'ar' ? 'يدوي' : 'Manual');
            showToast('success', `${c.caseId} → ${lang === 'ar' ? ROOM_MAP[prev].ar : ROOM_MAP[prev].en}`);
            onClose();
          }}
          className="btn btn-ghost flex-1 justify-center"
        >
          <ChevronRight size={13} style={{ transform: isRtl ? 'none' : 'scaleX(-1)' }} />
          {t.moveBack}
        </button>
      )}
      {nextRoomId(c.currentRoom) && (
        <button
          onClick={() => {
            const next = nextRoomId(c.currentRoom);
            moveCaseToRoom(c.id, next, lang === 'ar' ? 'يدوي' : 'Manual');
            showToast('success', `${c.caseId} → ${lang === 'ar' ? ROOM_MAP[next].ar : ROOM_MAP[next].en}`);
            onClose();
          }}
          className="btn btn-primary flex-1 justify-center"
        >
          {t.moveNext}
          <ChevronRight size={13} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
        </button>
      )}
    </div>
  </div>
</div>

{/* Timeline */}
<div className="px-5 pb-5">
  <div className="text-[10.5px] uppercase font-bold tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
    <History size={11} className="inline mr-1" />
    {t.timeline}
  </div>
  <div className="rounded-xl p-3" style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(120, 180, 255, 0.08)' }}>
    {(c.roomHistory && c.roomHistory.length > 0) ? c.roomHistory.map((h, i) => {
      const r = ROOM_MAP[h.room];
      if (!r) return null;
      const isLast = i === c.roomHistory.length - 1;
      return (
        <div key={i} className="flex items-start gap-3 py-2">
          <div className="flex flex-col items-center" style={{ paddingTop: 4 }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${r.color}25`, border: `1px solid ${r.color}50` }}>
              <r.icon size={10} color={r.color} />
            </div>
            {!isLast && <div className="w-px h-6 mt-1" style={{ background: 'rgba(120, 180, 255, 0.15)' }} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>
              {lang === 'ar' ? r.ar : r.en}
            </div>
            <div className="text-[10.5px]" style={{ color: 'var(--text-3)' }}>
              {h.by} · {new Date(h.at).toLocaleString(lang === 'ar' ? 'ar' : 'en')}
            </div>
          </div>
        </div>
      );
    }) : (
      <div className="text-center py-3 text-[12px]" style={{ color: 'var(--text-3)' }}>
        {lang === 'ar' ? 'لا يوجد سجل' : 'No history yet'}
      </div>
    )}
  </div>
</div>

  </div>
</div>

);
}

// MiniStat reusable
function MiniStat({ label, value, subLabel, color, icon: Icon }) {
return (

<div className="glass rounded-xl p-3.5 flex items-center gap-3 data-card">
<div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
<Icon size={15} color={color} />
</div>
<div className="min-w-0">
<div className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>{label}</div>
<div className="mono text-base font-bold truncate" style={{ color: 'var(--text)' }}>{value}</div>
<div className="text-[10.5px]" style={{ color: 'var(--text-3)' }}>{subLabel}</div>
</div>
</div>
);
}

// ═══════════════════════════════════════════════════════════════════════
//  QR SCANNER VIEW
//  Uses BarcodeDetector API (Chrome 88+, Safari 17+, Edge, Android)
//  Falls back to manual entry for older browsers
// ═══════════════════════════════════════════════════════════════════════
function ScannerView({ ctx }) {
const { state, t, lang, isRtl, moveCaseByQrCode, setActiveTech, getName, showToast } = ctx;
const activeTech = state.technicians.find(tch => tch.id === state.activeTechId);
const [scanning, setScanning] = useState(false);
const [error, setError] = useState(null);
const [manualId, setManualId] = useState('');
const [lastScanned, setLastScanned] = useState(null);
const [supported, setSupported] = useState(true);
const videoRef = useRef(null);
const streamRef = useRef(null);
const detectorRef = useRef(null);
const rafRef = useRef(null);
const lastDetectionRef = useRef(0);
// Always points at the latest handleDetection so the scan loop never calls a
// stale closure (which would read an outdated `state.cases`).
const handleDetectionRef = useRef(null);

// Feature detection
useEffect(() => {
if (typeof window === 'undefined') return;
if (!('BarcodeDetector' in window)) {
setSupported(false);
}
}, []);

const stopScanning = useCallback(() => {
if (rafRef.current) cancelAnimationFrame(rafRef.current);
if (streamRef.current) {
streamRef.current.getTracks().forEach(t => t.stop());
streamRef.current = null;
}
if (videoRef.current) videoRef.current.srcObject = null;
setScanning(false);
}, []);

useEffect(() => () => stopScanning(), [stopScanning]);

const handleDetection = useCallback((text) => {
// Debounce: ignore duplicate detections within 2 seconds
const now = Date.now();
if (now - lastDetectionRef.current < 2000) return;
lastDetectionRef.current = now;

const byName = activeTech ? getName(activeTech) : (lang === 'ar' ? 'فني' : 'Tech');
const result = moveCaseByQrCode(text, byName);
if (result.success) {
const newRoom = ROOM_MAP[result.newRoom];
const roomName = lang === 'ar' ? newRoom.ar : newRoom.en;
setLastScanned({
success: true,
caseId: result.case.caseId,
patient: result.case.patient,
room: roomName,
roomColor: newRoom.color,
});
showToast('success', `${result.case.caseId} → ${roomName}`);
// Vibrate on success (mobile)
if (navigator.vibrate) navigator.vibrate(100);
} else {
setLastScanned({ success: false, text, reason: result.reason });
showToast('error', result.reason === 'finished' ? (lang === 'ar' ? 'الحالة في المكتب بالفعل' : 'Already in office') : t.caseNotFound);
if (navigator.vibrate) navigator.vibrate([60, 60, 60]);
}

}, [activeTech, getName, lang, moveCaseByQrCode, showToast, t.caseNotFound]);

// Keep the ref pointed at the freshest handleDetection every render.
useEffect(() => { handleDetectionRef.current = handleDetection; }, [handleDetection]);

const startScanning = async () => {
setError(null);
if (!supported) {
setError(t.cameraUnsupported);
return;
}
try {
// Request rear camera
const stream = await navigator.mediaDevices.getUserMedia({
video: { facingMode: { ideal: 'environment' } },
audio: false
});
streamRef.current = stream;
if (videoRef.current) {
videoRef.current.srcObject = stream;
videoRef.current.setAttribute('playsinline', 'true'); // important for iOS Safari
await videoRef.current.play();
}
detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
setScanning(true);

const scanLoop = async () => {
if (!videoRef.current || !detectorRef.current) return;
try {
if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
const codes = await detectorRef.current.detect(videoRef.current);
if (codes && codes.length > 0) {
handleDetectionRef.current?.(codes[0].rawValue);
}
}
} catch (err) { /* ignore individual frame errors */ }
rafRef.current = requestAnimationFrame(scanLoop);
};
scanLoop();
} catch (err) {
setError(err.name === 'NotAllowedError' ? t.cameraDenied : (err.message || 'Camera error'));
stopScanning();
}

};

const handleManualSubmit = (e) => {
e.preventDefault();
if (!manualId.trim()) return;
handleDetection(manualId.trim());
setManualId('');
};

if (!activeTech) {
// Tech selection screen
return (

<div className="space-y-5">
<div className="glass rounded-2xl p-6 text-center max-w-2xl mx-auto">
<div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: 'rgba(167, 139, 250, 0.15)', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
<User size={28} color="#a78bfa" />
</div>
<h2 className="display-font text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
{t.selectTech}
</h2>
<p className="text-[12.5px] mb-5" style={{ color: 'var(--text-3)' }}>
{lang === 'ar' ? 'اختر اسمك لتسجيل دخولك للماسح' : 'Pick your name to sign in to the scanner'}
</p>

  <div className="grid sm:grid-cols-2 gap-2.5 text-start">
    {state.technicians.map(tech => {
      const r = ROOM_MAP[tech.room] || ROOM_MAP['processing'];
      return (
        <button
          key={tech.id}
          onClick={() => {
            setActiveTech(tech.id);
            showToast('success', `${lang === 'ar' ? 'مرحباً' : 'Welcome'} ${getName(tech)}`);
          }}
          className="rounded-xl p-3 flex items-center gap-3 transition-all data-card text-start"
          style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(120, 180, 255, 0.1)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}>
            <span className="text-base font-bold" style={{ color: '#ffffff' }}>{getName(tech).charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold truncate" style={{ color: 'var(--text)' }}>{getName(tech)}</div>
            <div className="flex items-center gap-1 text-[10.5px]" style={{ color: r.color }}>
              <r.icon size={10} />
              <span>{lang === 'ar' ? r.ar : r.en}</span>
            </div>
          </div>
          <ChevronRight size={14} color="#94a3c4" style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
        </button>
      );
    })}
  </div>
</div>

  </div>
);

}

const techRoom = ROOM_MAP[activeTech.room] || ROOM_MAP['processing'];

return (

<div className="space-y-5 max-w-2xl mx-auto">
{/* Active tech header */}
<div className="glass rounded-2xl p-4 flex items-center gap-3">
<div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}>
<span className="text-base font-bold" style={{ color: '#ffffff' }}>{getName(activeTech).charAt(0).toUpperCase()}</span>
</div>
<div className="flex-1 min-w-0">
<div className="text-[10.5px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)' }}>
{lang === 'ar' ? 'مسجل دخول كـ' : 'Signed in as'}
</div>
<div className="text-[14px] font-bold truncate" style={{ color: 'var(--text)' }}>{getName(activeTech)}</div>
<div className="flex items-center gap-1 text-[11px]" style={{ color: techRoom.color }}>
<techRoom.icon size={11} />
<span>{lang === 'ar' ? techRoom.ar : techRoom.en}</span>
</div>
</div>
<button
onClick={() => { stopScanning(); setActiveTech(null); }}
className="btn btn-ghost"
>
{lang === 'ar' ? 'تسجيل خروج' : 'Sign out'}
</button>
</div>

{/* Scanner camera */}

  <div className="glass rounded-2xl overflow-hidden">
    <div
      className="relative aspect-square sm:aspect-video bg-black flex items-center justify-center"
      style={{ minHeight: 280 }}
    >
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ display: scanning ? 'block' : 'none' }}
      />

  {!scanning && (
    <div className="text-center p-6">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
        <Camera size={26} color="#0891b2" />
      </div>
      <div className="text-[14px] font-bold mb-1" style={{ color: 'var(--text)' }}>
        {t.scanInstructions}
      </div>
      <div className="text-[11.5px]" style={{ color: 'var(--text-3)' }}>
        {supported ? (lang === 'ar' ? 'اضغط بدء المسح' : 'Tap "Start Scan" to begin') : t.cameraUnsupported}
      </div>
    </div>
  )}

  {scanning && (
    <>
      {/* Overlay frame */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative" style={{ width: 240, height: 240 }}>
          {/* Corner brackets */}
          {[{t:0,l:0,r:0,b:'auto'}, {t:0,r:0,l:'auto',b:'auto'}, {b:0,l:0,t:'auto',r:'auto'}, {b:0,r:0,t:'auto',l:'auto'}].map((pos, i) => (
            <div key={i} className="absolute w-8 h-8" style={{
              top: pos.t, bottom: pos.b, left: pos.l, right: pos.r,
              borderTop: pos.t === 0 ? '3px solid #0891b2' : 'none',
              borderBottom: pos.b === 0 ? '3px solid #0891b2' : 'none',
              borderLeft: pos.l === 0 ? '3px solid #0891b2' : 'none',
              borderRight: pos.r === 0 ? '3px solid #0891b2' : 'none',
            }} />
          ))}
          {/* Scan line */}
          <div
            className="absolute left-0 right-0 h-0.5 scan-line"
            style={{ background: 'linear-gradient(90deg, transparent, #0891b2, transparent)', boxShadow: '0 0 12px #0891b2' }}
          />
        </div>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: 'rgba(0, 0, 0, 0.7)', color: '#0891b2', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-soft mr-1.5" />
        {lang === 'ar' ? 'جاري المسح...' : 'Scanning...'}
      </div>
    </>
  )}
</div>

<div className="p-4 flex gap-2">
  {!scanning ? (
    <button
      onClick={startScanning}
      disabled={!supported}
      className="btn btn-primary flex-1 justify-center"
      style={{ opacity: supported ? 1 : 0.5, padding: '12px 16px', fontSize: 14 }}
    >
      <Camera size={15} />
      {t.startScan}
    </button>
  ) : (
    <button
      onClick={stopScanning}
      className="btn btn-danger flex-1 justify-center"
      style={{ padding: '12px 16px', fontSize: 14 }}
    >
      <X size={15} />
      {t.stopScan}
    </button>
  )}
</div>

{error && (
  <div className="px-4 pb-4">
    <div className="rounded-lg p-3 text-[12px] flex items-start gap-2" style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#f87171' }}>
      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
      <div>{error}</div>
    </div>
  </div>
)}

  </div>

{/* Manual entry fallback */}

  <div className="glass rounded-2xl p-4">
    <div className="text-[10.5px] uppercase font-bold tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
      {t.manualEntry}
    </div>
    <form onSubmit={handleManualSubmit} className="flex gap-2">
      <input
        className="themed flex-1"
        placeholder={t.enterCaseId + ' (C-2606-001)'}
        value={manualId}
        onChange={e => setManualId(e.target.value)}
        style={{ fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}
      />
      <button type="submit" className="btn btn-primary">
        <Check size={13} />
        {lang === 'ar' ? 'تأكيد' : 'Submit'}
      </button>
    </form>
  </div>

{/* Last scan result */}
{lastScanned && (
<div
className="glass rounded-2xl p-4 fade-up"
style={{
borderColor: lastScanned.success ? 'rgba(52, 211, 153, 0.35)' : 'rgba(248, 113, 113, 0.35)',
background: lastScanned.success ? 'rgba(52, 211, 153, 0.05)' : 'rgba(248, 113, 113, 0.05)',
}}
>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{
background: lastScanned.success ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
}}>
{lastScanned.success ? <CheckCircle2 size={18} color="#34d399" /> : <AlertTriangle size={18} color="#f87171" />}
</div>
<div className="flex-1 min-w-0">
<div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>
{lastScanned.success ? t.scanSuccess : t.caseNotFound}
</div>
{lastScanned.success ? (
<div className="text-[11.5px]" style={{ color: 'var(--text-2)' }}>
<span className="mono">{lastScanned.caseId}</span> · {lastScanned.patient}
{' '}<ArrowRight size={10} className="inline" />
<span style={{ color: lastScanned.roomColor }}> {lastScanned.room}</span>
</div>
) : (
<div className="text-[11.5px] mono" style={{ color: 'var(--text-3)' }}>{lastScanned.text}</div>
)}
</div>
</div>
</div>
)}

{/* Cases assigned to this tech's room */}

  <div className="glass rounded-2xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <techRoom.icon size={14} color={techRoom.color} />
      <div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>
        {lang === 'ar' ? 'الحالات في غرفتك' : 'Cases in your room'}
      </div>
      <span className="mono text-[10px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: `${techRoom.color}15`, color: techRoom.color }}>
        {state.cases.filter(c => c.currentRoom === activeTech.room && c.status !== 'delivered').length}
      </span>
    </div>
    <div className="space-y-1.5">
      {state.cases.filter(c => c.currentRoom === activeTech.room && c.status !== 'delivered').slice(0, 5).map(c => (
        <div key={c.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(241, 245, 249, 0.7)' }}>
          <div className="min-w-0">
            <div className="mono text-[11px] font-bold" style={{ color: 'var(--text-3)' }}>{c.caseId}</div>
            <div className="text-[12px] font-semibold truncate" style={{ color: 'var(--text)' }}>{c.patient}</div>
          </div>
          <div className="text-[10.5px] mono" style={{ color: 'var(--text-3)' }}>
            {timeSince(c.roomHistory?.[c.roomHistory.length - 1]?.at, lang)}
          </div>
        </div>
      ))}
      {state.cases.filter(c => c.currentRoom === activeTech.room && c.status !== 'delivered').length === 0 && (
        <div className="text-center py-4 text-[12px]" style={{ color: 'var(--text-3)' }}>{t.noCases}</div>
      )}
    </div>
  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  CALCULATOR (cost & scenarios)
// ConfigPanel reusable
function ConfigPanel({ title, subtitle, icon: Icon, color, items, listName, ctx, fields, onAdd, presets, presetType, showPreset, setShowPreset, pickPreset }) {
const { setField, removeItem, getName, t, lang } = ctx;
const presetOpen = showPreset === presetType;

return (

<div className="glass rounded-2xl overflow-hidden">
<div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
<div className="flex items-center gap-2.5">
<div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
<Icon size={13} color={color} />
</div>
<div>
<div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{title}</div>
<div className="text-[10.5px]" style={{ color: 'var(--text-3)' }}>{subtitle}</div>
</div>
</div>
<span className="text-[10px] mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(120, 180, 255, 0.08)', color: 'var(--text-2)' }}>
{items.length}
</span>
</div>

  <div className="p-3 space-y-2 max-h-72 scroll-y">
    {items.length === 0 ? (
      <div className="text-center py-6 text-[12px]" style={{ color: 'var(--text-3)' }}>
        {lang === 'ar' ? 'لا توجد عناصر' : 'No items yet'}
      </div>
    ) : items.map(item => (
      <div key={item.id} className="rounded-lg p-2 flex items-center gap-2" style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(120, 180, 255, 0.06)' }}>
        <input
          className="themed flex-1"
          value={getName(item)}
          onChange={e => setField(listName, item.id, 'name', e.target.value)}
          style={{ padding: '4px 8px', fontSize: 12, textAlign: 'start' }}
        />
        {fields.map(f => (
          <input
            key={f.key} type={f.type} className="themed mono w-20"
            value={item[f.key]}
            onChange={e => setField(listName, item.id, f.key, e.target.value)}
            style={{ padding: '4px 6px', fontSize: 11.5 }}
            title={f.label}
          />
        ))}
        <button
          onClick={() => removeItem(listName, item.id)}
          className="w-6 h-6 rounded flex items-center justify-center shrink-0"
          style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.18)' }}
        >
          <Trash2 size={10} color="#f87171" />
        </button>
      </div>
    ))}
  </div>

  <div className="p-3 pt-0 flex gap-2">
    <button onClick={onAdd} className="btn btn-ghost flex-1 justify-center">
      <Plus size={12} />
      {t.addNew}
    </button>
    {presets && (
      <button
        onClick={() => setShowPreset(presetOpen ? null : presetType)}
        className="btn btn-ghost"
      >
        <Sparkles size={12} />
        {t.presets}
      </button>
    )}
  </div>

{presetOpen && presets && (
<div className="p-3 pt-0 max-h-48 scroll-y space-y-1.5">
{presets.map((p, i) => (
<button
key={i}
onClick={() => pickPreset(presetType, p)}
className="w-full p-2 rounded-lg text-start flex items-center justify-between"
style={{ background: 'rgba(120, 180, 255, 0.04)', border: '1px solid rgba(120, 180, 255, 0.08)' }}
>
<span className="text-[12px]" style={{ color: 'var(--text)' }}>{lang === 'ar' ? p.ar : p.en}</span>
<span className="mono text-[10.5px]" style={{ color: 'var(--text-3)' }}>
{p.price || p.salary || p.amount} KD
</span>
</button>
))}
</div>
)}

</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  TOOTH SELECTOR (FDI Numbering System)
// ═══════════════════════════════════════════════════════════════════════
function ToothSelector({ selectedTeeth = [], onChange, lang, t }) {
// FDI Tooth Numbering:
// Upper Right (1): 18,17,16,15,14,13,12,11
// Upper Left (2): 21,22,23,24,25,26,27,28
// Lower Left (3): 38,37,36,35,34,33,32,31
// Lower Right (4): 41,42,43,44,45,46,47,48
const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerLeft = [38, 37, 36, 35, 34, 33, 32, 31];
const lowerRight = [41, 42, 43, 44, 45, 46, 47, 48];

const toggleTooth = (num) => {
if (selectedTeeth.includes(num)) {
onChange(selectedTeeth.filter(t => t !== num));
} else {
onChange([...selectedTeeth, num].sort((a, b) => a - b));
}
};

const clearAll = () => onChange([]);

const ToothButton = ({ num }) => {
const isSelected = selectedTeeth.includes(num);
return (
<button
type="button"
onClick={() => toggleTooth(num)}
className="tooth-btn"
style={{
width: 36,
height: 44,
borderRadius: 6,
border: isSelected ? '2px solid #0891b2' : '1px solid rgba(120, 180, 255, 0.15)',
background: isSelected
? 'linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(56, 189, 248, 0.15))'
: 'rgba(241, 245, 249, 0.7)',
color: isSelected ? '#0891b2' : 'var(--text-2)',
fontSize: 11,
fontFamily: 'monospace',
fontWeight: 700,
cursor: 'pointer',
transition: 'all 0.15s',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none',
}}
>
{num}
</button>
);
};

return (
<div className="space-y-4">
{/* Header with counter */}
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<Smile size={14} color="#0891b2" />
<span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
{t.selectedTeeth}: <span className="mono" style={{ color: '#0891b2' }}>{selectedTeeth.length}</span>
</span>
</div>
{selectedTeeth.length > 0 && (
<button
type="button"
onClick={clearAll}
className="text-[10.5px] uppercase tracking-wider font-semibold px-2 py-1 rounded"
style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)' }}
>
<X size={10} className="inline mr-1" />
{t.clearSelection}
</button>
)}
</div>

  {/* Upper Jaw */}
  <div>
    <div className="text-[10.5px] uppercase tracking-widest font-semibold mb-2 text-center" style={{ color: 'var(--text-3)' }}>
      {t.upperJaw}
    </div>
    <div className="flex items-center justify-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(120, 180, 255, 0.08)' }}>
      <div className="flex gap-1">
        {upperRight.map(n => <ToothButton key={n} num={n} />)}
      </div>
      <div style={{ width: 1, height: 32, background: 'rgba(120, 180, 255, 0.2)' }} />
      <div className="flex gap-1">
        {upperLeft.map(n => <ToothButton key={n} num={n} />)}
      </div>
    </div>
  </div>

  {/* Lower Jaw */}
  <div>
    <div className="flex items-center justify-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(120, 180, 255, 0.08)' }}>
      <div className="flex gap-1">
        {lowerRight.map(n => <ToothButton key={n} num={n} />)}
      </div>
      <div style={{ width: 1, height: 32, background: 'rgba(120, 180, 255, 0.2)' }} />
      <div className="flex gap-1">
        {lowerLeft.map(n => <ToothButton key={n} num={n} />)}
      </div>
    </div>
    <div className="text-[10.5px] uppercase tracking-widest font-semibold mt-2 text-center" style={{ color: 'var(--text-3)' }}>
      {t.lowerJaw}
    </div>
  </div>

  {/* Selected list preview */}
  {selectedTeeth.length > 0 && (
    <div className="p-2 rounded-lg" style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-3)' }}>
        {t.selectedTeeth}:
      </div>
      <div className="font-mono text-xs" style={{ color: '#0891b2' }}>
        {selectedTeeth.join(', ')}
      </div>
    </div>
  )}
</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  CASE INTAKE MODAL (Full-Page Form)
// ═══════════════════════════════════════════════════════════════════════
function CaseIntakeModal({ ctx, onClose, onSave }) {
const { state, t, lang, isRtl } = ctx;

const today = new Date().toISOString().split('T')[0];
// Build a collision-safe case number: find the highest existing sequence for
// this year-month prefix and increment it (length+1 can repeat after deletes).
const ymPrefix = `C-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-`;
const maxSeq = state.cases.reduce((max, c) => {
const m = (c.caseId || '').match(new RegExp(`^${ymPrefix}(\\d+)$`));
return m ? Math.max(max, parseInt(m[1], 10)) : max;
}, 0);
const defaultCaseId = `${ymPrefix}${String(maxSeq + 1).padStart(3, '0')}`;

// Form state
const [form, setForm] = useState({
// Basic
caseId: defaultCaseId,
doctorName: '',
patient: '',
clinic: '',
date: today,
shade: '',
// Material
material: 'zirconia',
// Type of Work
typeOfWork: 'crown',
// Tooth Selection
selectedTeeth: [],
// Intake Status
intakeStatus: 'incomplete', // 'complete' or 'incomplete'
// Required Info Checklist
hasPrescription: false,
hasImpression: false,
hasBite: false,
hasShade: false,
hasOpposing: false,
// Missing items
missingImpression: false,
missingBite: false,
missingShade: false,
missingImplant: false,
// Implant info
isImplant: false,
implantType: 'single', // single, bridge, fullArch
retention: 'screw', // screw, cement
// Implant components
implantSystemSpec: false,
implantPosClear: false,
impressionCopingReceived: false,
analogReceived: false,
abutmentProvided: false,
screwsProvided: false,
scanbodyType: false,
scanbodyBrandHeight: false,
scanbodyTight: false,
implantLibrary: false,
stlFiles: false,
// Intake info
intakeTech: '',
notes: '',
// Auto-fields
units: 1,
price: 30,
deadline: futureDateStr(5),
});

const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

const handleSubmit = () => {
// Build the case object
const newCase = {
caseId: form.caseId,
patient: form.patient || (lang === 'ar' ? 'مريض جديد' : 'New Patient'),
clinic: form.clinic || (lang === 'ar' ? 'عيادة' : 'Clinic'),
doctorName: form.doctorName,
type: form.material,
typeOfWork: form.typeOfWork,
teeth: form.selectedTeeth,
shade: form.shade,
units: form.selectedTeeth.length || form.units,
price: form.price,
status: 'pending',
technician: form.intakeTech,
date: form.date,
remake: false,
currentRoom: 'reception',
deadline: form.deadline,
intakeStatus: form.intakeStatus,
isImplant: form.isImplant,
implantData: form.isImplant ? {
type: form.implantType,
retention: form.retention,
systemSpec: form.implantSystemSpec,
posClear: form.implantPosClear,
impressionCoping: form.impressionCopingReceived,
analog: form.analogReceived,
abutment: form.abutmentProvided,
screws: form.screwsProvided,
scanbodyType: form.scanbodyType,
scanbodyBrandHeight: form.scanbodyBrandHeight,
scanbodyTight: form.scanbodyTight,
library: form.implantLibrary,
stl: form.stlFiles,
} : null,
checklist: {
prescription: form.hasPrescription,
impression: form.hasImpression,
bite: form.hasBite,
shade: form.hasShade,
opposing: form.hasOpposing,
},
missing: {
impression: form.missingImpression,
bite: form.missingBite,
shade: form.missingShade,
implant: form.missingImplant,
},
notes: form.notes,
roomHistory: [{
room: 'reception',
at: nowIso(),
by: form.intakeTech || (lang === 'ar' ? 'استقبال' : 'Reception')
}]
};
onSave(newCase);
onClose();
};

// Checkbox component (uses Check icon from lucide-react)
const Checkbox = ({ checked, onChange, label, color = '#34d399' }) => (
<label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg transition"
style={{
background: checked ? `${color}10` : 'rgba(241, 245, 249, 0.6)',
border: `1px solid ${checked ? color + '30' : 'rgba(120, 180, 255, 0.08)'}`
}}>
<div
className="w-4 h-4 rounded flex items-center justify-center shrink-0"
style={{
background: checked ? color : 'transparent',
border: `1.5px solid ${checked ? color : 'rgba(120, 180, 255, 0.3)'}`
}}
>
{checked && <Check size={10} color="#fff" strokeWidth={3} />}
</div>
<input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
<span className="text-[11.5px] font-medium" style={{ color: checked ? color : 'var(--text-2)' }}>{label}</span>
</label>
);

// Material option
const MatOption = ({ value, label, icon: Icon, color }) => {
const active = form.material === value;
return (
<button
type="button"
onClick={() => update('material', value)}
className="p-3 rounded-lg flex flex-col items-center gap-2 transition"
style={{
background: active ? `${color}15` : 'rgba(241, 245, 249, 0.6)',
border: `1px solid ${active ? color + '40' : 'rgba(120, 180, 255, 0.1)'}`,
boxShadow: active ? `0 0 16px ${color}30` : 'none',
}}
>
<Icon size={20} color={active ? color : 'var(--text-3)'} />
<span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: active ? color : 'var(--text-2)' }}>
{label}
</span>
</button>
);
};

// Work type option
const WorkOption = ({ value, label, icon: Icon }) => {
const active = form.typeOfWork === value;
const color = '#a78bfa';
return (
<button
type="button"
onClick={() => update('typeOfWork', value === 'implant' ? 'implant' : value)}
className="p-2.5 rounded-lg flex flex-col items-center gap-1.5 transition flex-1"
style={{
background: active ? `${color}15` : 'rgba(241, 245, 249, 0.6)',
border: `1px solid ${active ? color + '40' : 'rgba(120, 180, 255, 0.1)'}`,
}}
>
<Icon size={16} color={active ? color : 'var(--text-3)'} />
<span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: active ? color : 'var(--text-2)' }}>
{label}
</span>
</button>
);
};

return (
<div
className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '20px' }}
onClick={onClose}
>
<div
className="glass-strong rounded-2xl w-full max-w-4xl my-4"
style={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid rgba(120, 180, 255, 0.2)' }}
onClick={e => e.stopPropagation()}
>
{/* Header */}
<div
className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b"
style={{
borderColor: 'rgba(120, 180, 255, 0.15)',
background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(167, 139, 250, 0.08))',
backdropFilter: 'blur(10px)',
}}
>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
<FileText size={18} color="#0891b2" />
</div>
<div>
<h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>{t.caseIntakeTitle}</h2>
<div className="text-[11px]" style={{ color: 'var(--text-3)' }}>{t.caseIntakeSubtitle}</div>
</div>
</div>
<button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
<X size={14} color="#f87171" />
</button>
</div>

    {/* Body */}
    <div className="p-6 space-y-6">
      
      {/* SECTION 1: Basic Info */}
      <section>
        <SectionHeader icon={User} color="#0891b2" title={t.basicInfo} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label={t.doctorName} value={form.doctorName} onChange={v => update('doctorName', v)} />
          <Field label={t.patientName} value={form.patient} onChange={v => update('patient', v)} />
          <Field label={t.caseNumber} value={form.caseId} onChange={v => update('caseId', v)} mono />
          <Field label={t.clinic} value={form.clinic} onChange={v => update('clinic', v)} />
          <Field label={t.caseDate} value={form.date} onChange={v => update('date', v)} type="date" />
          <Field label={t.shade} value={form.shade} onChange={v => update('shade', v)} placeholder="A1, A2, B1..." />
        </div>
      </section>

      {/* SECTION 2: Material Type */}
      <section>
        <SectionHeader icon={Layers} color="#a78bfa" title={t.materialType} />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <MatOption value="zirconia" label={t.zirconiaTitle} icon={Smile} color="#f472b6" />
          <MatOption value="emax" label={t.emaxTitle} icon={Crown} color="#a78bfa" />
          <MatOption value="emaxCad" label={t.emaxCadTitle} icon={Cpu} color="#0891b2" />
          <MatOption value="pmma" label={t.pmmaTitle} icon={Layers} color="#fb923c" />
          <MatOption value="acrylic" label={t.acrylicTitle} icon={Package} color="#34d399" />
        </div>
      </section>

      {/* SECTION 3: Type of Work */}
      <section>
        <SectionHeader icon={Wrench} color="#f5b942" title={t.typeOfWork} />
        <div className="flex gap-2 flex-wrap">
          <WorkOption value="crown" label={t.crown} icon={Crown} />
          <WorkOption value="bridge" label={t.bridge} icon={GitBranch} />
          <WorkOption value="implant" label={lang === 'ar' ? 'زراعة' : 'Implant'} icon={Bone} />
          <WorkOption value="other" label={t.other} icon={MoreHorizontal} />
        </div>
        {/* Implant sub-options */}
        {form.typeOfWork === 'implant' && (
          <div className="mt-3 p-3 rounded-lg space-y-2" style={{ background: 'rgba(248, 113, 113, 0.05)', border: '1px solid rgba(248, 113, 113, 0.15)' }}>
            <div className="text-[10.5px] uppercase tracking-wider font-bold" style={{ color: '#f87171' }}>
              {t.implantTitle}
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { v: 'single', l: t.implantSingle },
                { v: 'bridge', l: t.implantBridge },
                { v: 'fullArch', l: t.implantFullArch }
              ].map(opt => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => { update('implantType', opt.v); update('isImplant', true); }}
                  className="px-3 py-1.5 rounded text-[11px] font-semibold"
                  style={{
                    background: form.implantType === opt.v ? 'rgba(248, 113, 113, 0.15)' : 'rgba(241, 245, 249, 0.7)',
                    border: `1px solid ${form.implantType === opt.v ? 'rgba(248, 113, 113, 0.4)' : 'rgba(120, 180, 255, 0.1)'}`,
                    color: form.implantType === opt.v ? '#f87171' : 'var(--text-2)',
                  }}
                >
                  {opt.l}
                </button>
              ))}
            </div>
            {/* Retention */}
            <div className="pt-2 border-t" style={{ borderColor: 'rgba(248, 113, 113, 0.1)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>
                {t.retentionTitle}:
              </div>
              <div className="flex gap-2">
                {[
                  { v: 'screw', l: t.screwRetained },
                  { v: 'cement', l: t.cementRetained }
                ].map(opt => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => update('retention', opt.v)}
                    className="px-3 py-1.5 rounded text-[11px] font-semibold flex-1"
                    style={{
                      background: form.retention === opt.v ? 'rgba(248, 113, 113, 0.15)' : 'rgba(241, 245, 249, 0.7)',
                      border: `1px solid ${form.retention === opt.v ? 'rgba(248, 113, 113, 0.4)' : 'rgba(120, 180, 255, 0.1)'}`,
                      color: form.retention === opt.v ? '#f87171' : 'var(--text-2)',
                    }}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 4: Tooth Selection */}
      <section>
        <SectionHeader icon={Smile} color="#34d399" title={t.toothSelectionTitle} />
        <ToothSelector 
          selectedTeeth={form.selectedTeeth} 
          onChange={teeth => update('selectedTeeth', teeth)} 
          lang={lang}
          t={t}
        />
      </section>

      {/* SECTION 5: Intake Status (MANDATORY) */}
      <section>
        <SectionHeader icon={AlertTriangle} color="#f5b942" title={t.intakeStatusTitle} />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => update('intakeStatus', 'complete')}
            className="p-3 rounded-lg flex items-center gap-2 transition"
            style={{
              background: form.intakeStatus === 'complete' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(241, 245, 249, 0.6)',
              border: `1.5px solid ${form.intakeStatus === 'complete' ? '#34d399' : 'rgba(120, 180, 255, 0.1)'}`,
            }}
          >
            <CheckCircle2 size={16} color={form.intakeStatus === 'complete' ? '#34d399' : 'var(--text-3)'} />
            <span className="text-xs font-bold" style={{ color: form.intakeStatus === 'complete' ? '#34d399' : 'var(--text-2)' }}>
              {t.caseCompleteStatus}
            </span>
          </button>
          <button
            type="button"
            onClick={() => update('intakeStatus', 'incomplete')}
            className="p-3 rounded-lg flex items-center gap-2 transition"
            style={{
              background: form.intakeStatus === 'incomplete' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(241, 245, 249, 0.6)',
              border: `1.5px solid ${form.intakeStatus === 'incomplete' ? '#f87171' : 'rgba(120, 180, 255, 0.1)'}`,
            }}
          >
            <AlertTriangle size={16} color={form.intakeStatus === 'incomplete' ? '#f87171' : 'var(--text-3)'} />
            <span className="text-xs font-bold" style={{ color: form.intakeStatus === 'incomplete' ? '#f87171' : 'var(--text-2)' }}>
              {t.caseIncompleteStatus}
            </span>
          </button>
        </div>
      </section>

      {/* SECTION 6: Required Info Checklist */}
      <section>
        <SectionHeader icon={CheckCircle2} color="#34d399" title={t.requiredInfoTitle} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Checkbox checked={form.hasPrescription} onChange={() => update('hasPrescription', !form.hasPrescription)} label={t.doctorPrescription} />
          <Checkbox checked={form.hasImpression} onChange={() => update('hasImpression', !form.hasImpression)} label={t.impressionScan} />
          <Checkbox checked={form.hasBite} onChange={() => update('hasBite', !form.hasBite)} label={t.biteRegistration} />
          <Checkbox checked={form.hasShade} onChange={() => update('hasShade', !form.hasShade)} label={t.shadeInfo} />
          <Checkbox checked={form.hasOpposing} onChange={() => update('hasOpposing', !form.hasOpposing)} label={t.opposingArch} />
        </div>
      </section>

      {/* SECTION 7: Missing Items */}
      <section>
        <SectionHeader icon={X} color="#f87171" title={t.missingTitle} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Checkbox checked={form.missingImpression} onChange={() => update('missingImpression', !form.missingImpression)} label={t.missingImpression} color="#f87171" />
          <Checkbox checked={form.missingBite} onChange={() => update('missingBite', !form.missingBite)} label={t.missingBite} color="#f87171" />
          <Checkbox checked={form.missingShade} onChange={() => update('missingShade', !form.missingShade)} label={t.missingShade} color="#f87171" />
          <Checkbox checked={form.missingImplant} onChange={() => update('missingImplant', !form.missingImplant)} label={t.missingImplantInfo} color="#f87171" />
        </div>
      </section>

      {/* SECTION 8: Implant Components (only if implant) */}
      {form.typeOfWork === 'implant' && (
        <section>
          <SectionHeader icon={Bone} color="#f87171" title={t.implantComponents} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Checkbox checked={form.implantSystemSpec} onChange={() => update('implantSystemSpec', !form.implantSystemSpec)} label={t.implantSystem} />
            <Checkbox checked={form.implantPosClear} onChange={() => update('implantPosClear', !form.implantPosClear)} label={t.implantPosition} />
            <Checkbox checked={form.impressionCopingReceived} onChange={() => update('impressionCopingReceived', !form.impressionCopingReceived)} label={t.impressionCoping} />
            <Checkbox checked={form.analogReceived} onChange={() => update('analogReceived', !form.analogReceived)} label={t.analog} />
            <Checkbox checked={form.abutmentProvided} onChange={() => update('abutmentProvided', !form.abutmentProvided)} label={t.abutment} />
            <Checkbox checked={form.screwsProvided} onChange={() => update('screwsProvided', !form.screwsProvided)} label={t.screws} />
            <Checkbox checked={form.scanbodyType} onChange={() => update('scanbodyType', !form.scanbodyType)} label={t.scanbodyType} />
            <Checkbox checked={form.scanbodyBrandHeight} onChange={() => update('scanbodyBrandHeight', !form.scanbodyBrandHeight)} label={t.scanbodyBrandHeight} />
            <Checkbox checked={form.scanbodyTight} onChange={() => update('scanbodyTight', !form.scanbodyTight)} label={t.scanbodyTight} />
            <Checkbox checked={form.implantLibrary} onChange={() => update('implantLibrary', !form.implantLibrary)} label={t.implantLibrary} />
            <Checkbox checked={form.stlFiles} onChange={() => update('stlFiles', !form.stlFiles)} label={t.stlFiles} />
          </div>
        </section>
      )}

      {/* SECTION 9: Pricing & Deadline */}
      <section>
        <SectionHeader icon={DollarSign} color="#f5b942" title={lang === 'ar' ? 'التسعير والموعد' : 'Pricing & Deadline'} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label={t.price + ' (' + t.currency + ')'} value={form.price} onChange={v => update('price', Number(v) || 0)} type="number" />
          <Field label={lang === 'ar' ? 'عدد الوحدات' : 'Units'} value={form.units} onChange={v => update('units', Number(v) || 1)} type="number" hint={form.selectedTeeth.length > 0 ? `(auto: ${form.selectedTeeth.length})` : ''} />
          <Field label={t.deadline} value={form.deadline} onChange={v => update('deadline', v)} type="date" />
        </div>
      </section>

      {/* SECTION 10: Intake Technician & Notes */}
      <section>
        <SectionHeader icon={UserCog} color="#0891b2" title={t.intakeTechnician} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Technician dropdown - reads from state.technicians */}
          <div>
            <label className="block text-[10.5px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-3)' }}>
              {t.intakeTechnician}
            </label>
            <select
              value={form.intakeTech}
              onChange={e => update('intakeTech', e.target.value)}
              className="themed w-full"
              style={{ padding: '8px 10px' }}
            >
              <option value="">{lang === 'ar' ? '— اختر الفني —' : '— Select Technician —'}</option>
              {state.technicians && state.technicians.map(tech => (
                <option key={tech.id} value={lang === 'ar' ? tech.name_ar : tech.name_en}>
                  {lang === 'ar' ? tech.name_ar : tech.name_en} {tech.role ? `(${tech.role})` : ''}
                </option>
              ))}
            </select>
            {state.technicians && state.technicians.length === 0 && (
              <div className="text-[10px] mt-1" style={{ color: '#f5b942' }}>
                {lang === 'ar' ? '⚠️ لا يوجد فنيين - أضف فنيين من قسم الفنيين' : '⚠️ No technicians yet - add them in Technicians tab'}
              </div>
            )}
          </div>
          <Field label={t.intakeNotes} value={form.notes} onChange={v => update('notes', v)} multiline />
        </div>
      </section>

    </div>

    {/* Footer */}
    <div 
      className="sticky bottom-0 px-6 py-4 flex items-center justify-end gap-3 border-t"
      style={{ 
        borderColor: 'rgba(120, 180, 255, 0.15)',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="btn btn-ghost"
      >
        <X size={14} />
        {t.cancelCase}
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        className="btn btn-primary"
      >
        <Save size={14} />
        {t.saveCase}
      </button>
    </div>
  </div>
</div>

);
}

// Section Header helper
function SectionHeader({ icon: Icon, color, title }) {
return (
<div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: `${color}20` }}>
<div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
<Icon size={13} color={color} />
</div>
<span className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>{title}</span>
</div>
);
}

// Field helper
function Field({ label, value, onChange, type = 'text', placeholder = '', mono = false, multiline = false, hint = '' }) {
return (
<div>
<label className="block text-[10.5px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-3)' }}>
{label} {hint && <span style={{ color: '#0891b2' }}>{hint}</span>}
</label>
{multiline ? (
<textarea
value={value}
onChange={e => onChange(e.target.value)}
placeholder={placeholder}
rows={2}
className="themed w-full"
style={{ fontFamily: mono ? 'monospace' : 'inherit', resize: 'vertical' }}
/>
) : (
<input
type={type}
value={value}
onChange={e => onChange(e.target.value)}
placeholder={placeholder}
className="themed w-full"
style={{ fontFamily: mono ? 'monospace' : 'inherit' }}
/>
)}
</div>
);
}

// ═══════════════════════════════════════════════════════════════════════
//  CASES VIEW
// ═══════════════════════════════════════════════════════════════════════
function CasesView({ ctx }) {
const { state, t, lang, isRtl, setField, addItem, removeItem, removeItemUndo } = ctx;
const [filter, setFilter] = useState('all');
const [search, setSearch] = useState('');
const [showQrCase, setShowQrCase] = useState(null);
const [showIntakeModal, setShowIntakeModal] = useState(false);

const typeIcons = {
zirconia: Smile, emax: Smile, implant: Bone, veneer: Smile,
denture: Smile, pmma: Layers, ortho: Wrench, cadcam: Cpu
};

const statusColors = {
pending: '#f5b942', inProgress: '#0891b2', completed: '#a78bfa', delivered: '#34d399'
};

const filtered = state.cases.filter(c => {
if (filter !== 'all' && filter !== 'remake' && c.status !== filter) return false;
if (filter === 'remake' && !c.remake) return false;
if (search && !c.caseId.toLowerCase().includes(search.toLowerCase()) && !c.patient.toLowerCase().includes(search.toLowerCase())) return false;
return true;
});

const statusCounts = {
all: state.cases.length,
pending: state.cases.filter(c => c.status === 'pending').length,
inProgress: state.cases.filter(c => c.status === 'inProgress').length,
completed: state.cases.filter(c => c.status === 'completed').length,
delivered: state.cases.filter(c => c.status === 'delivered').length,
remake: state.cases.filter(c => c.remake).length,
};

const handleAdd = () => {
setShowIntakeModal(true);
};

const handleSaveCase = (caseData) => {
addItem('cases', caseData);
};

return (

<div className="space-y-5">
{/* Filters */}
<div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
<div className="relative flex-1 min-w-[200px]">
<Search size={14} color="#5d6e92" className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
<input
className="themed" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)}
style={{ [isRtl ? 'paddingRight' : 'paddingLeft']: 34 }}
/>
</div>
<div className="flex gap-1 overflow-x-auto scroll-y">
{['all', 'pending', 'inProgress', 'completed', 'delivered', 'remake'].map(s => (
<button
key={s} onClick={() => setFilter(s)}
className={`tab-btn ${filter === s ? 'active' : ''} whitespace-nowrap`}
>
{s === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : t[s]}
<span className="mono ml-1 text-[10px] opacity-60">{statusCounts[s]}</span>
</button>
))}
</div>
<button onClick={handleAdd} className="btn btn-primary">
<Plus size={14} />
{t.addCase}
</button>
</div>

{/* Cases grid */}

  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
    {filtered.length === 0 ? (
      <div className="col-span-full glass rounded-2xl p-10 text-center" style={{ color: 'var(--text-3)' }}>
        <Briefcase size={32} className="mx-auto mb-2 opacity-30" />
        <div className="text-sm">{lang === 'ar' ? 'لا توجد حالات تطابق المعايير' : 'No cases match the criteria'}</div>
      </div>
    ) : (
      filtered.map(c => {
        const TypeIcon = typeIcons[c.type] || Layers;
        const value = c.units * c.price;
        const room = ROOM_MAP[c.currentRoom] || ROOM_MAP['reception'];
        const left = daysUntil(c.deadline);
        const overdue = left !== null && left < 0;
        return (
          <div key={c.id} className="glass rounded-xl p-4 data-card relative overflow-hidden">
            {c.remake && (
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest" style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171' }}>
                {t.remake}
              </div>
            )}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${statusColors[c.status]}18`, border: `1px solid ${statusColors[c.status]}30` }}>
                <TypeIcon size={16} color={statusColors[c.status]} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mono text-[10.5px] font-semibold mb-0.5" style={{ color: 'var(--text-3)' }}>{c.caseId}</div>
                <div className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{c.patient}</div>
                <div className="text-[11px] truncate" style={{ color: 'var(--text-2)' }}>{c.clinic}</div>
              </div>
            </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider" style={{ background: `${statusColors[c.status]}15`, color: statusColors[c.status] }}>
            {t[c.status]}
          </span>
          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1" style={{ background: `${room.color}15`, color: room.color }}>
            <room.icon size={9} />
            {lang === 'ar' ? room.ar : room.en}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(241, 245, 249, 0.7)' }}>
            <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>{t.units}</div>
            <div className="mono text-sm font-bold" style={{ color: 'var(--text)' }}>{c.units}</div>
          </div>
          {(() => {
            // Color-coded deadline system
            let dlColor = '#34d399'; // Green = safe
            let dlBg = 'rgba(52, 211, 153, 0.08)';
            let dlBorder = 'rgba(52, 211, 153, 0.2)';
            let dlIcon = CheckCircle2;
            let dlLabel = t.deadlineSafe;
            if (overdue) {
              dlColor = '#f87171';
              dlBg = 'rgba(248, 113, 113, 0.15)';
              dlBorder = 'rgba(248, 113, 113, 0.4)';
              dlIcon = AlertTriangle;
              dlLabel = t.deadlineOverdue;
            } else if (left !== null && left <= 1) {
              dlColor = '#f87171';
              dlBg = 'rgba(248, 113, 113, 0.12)';
              dlBorder = 'rgba(248, 113, 113, 0.3)';
              dlIcon = AlertTriangle;
              dlLabel = t.deadlineUrgent;
            } else if (left !== null && left <= 3) {
              dlColor = '#f5b942';
              dlBg = 'rgba(245, 185, 66, 0.12)';
              dlBorder = 'rgba(245, 185, 66, 0.3)';
              dlIcon = Clock;
              dlLabel = t.deadlineWarning;
            }
            const DlIcon = dlIcon;
            return (
              <div className="text-center p-2 rounded-lg" style={{ background: dlBg, border: `1px solid ${dlBorder}` }}>
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <DlIcon size={9} color={dlColor} />
                  <div className="text-[8.5px] uppercase tracking-wider font-bold" style={{ color: dlColor }}>{dlLabel}</div>
                </div>
                <div className="mono text-sm font-bold" style={{ color: dlColor }}>
                  {left !== null ? (overdue ? `${Math.abs(left)}d!` : left === 0 ? lang === 'ar' ? 'اليوم' : 'Today' : `${left}d`) : '—'}
                </div>
              </div>
            );
          })()}
          <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(52, 211, 153, 0.06)' }}>
            <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'القيمة' : 'Value'}</div>
            <div className="mono text-sm font-bold" style={{ color: '#34d399' }}>{value}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t text-[11px]" style={{ borderColor: 'rgba(120, 180, 255, 0.08)', color: 'var(--text-3)' }}>
          <span>{c.technician || (lang === 'ar' ? 'غير معين' : 'Unassigned')}</span>
          <span className="mono">{c.date}</span>
        </div>

        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
          <select
            value={c.status} onChange={e => setField('cases', c.id, 'status', e.target.value)}
            className="themed text-[11px] flex-1"
            style={{ padding: '4px 6px' }}
          >
            {['pending', 'inProgress', 'completed', 'delivered'].map(s => (
              <option key={s} value={s}>{t[s]}</option>
            ))}
          </select>
          <button
            onClick={() => setShowQrCase(c)}
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)' }}
            title={t.showQr}
          >
            <QrCode size={11} color="#a78bfa" />
          </button>
          <button
            onClick={() => setField('cases', c.id, 'remake', !c.remake)}
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ background: c.remake ? 'rgba(248, 113, 113, 0.15)' : 'rgba(120, 180, 255, 0.06)', border: `1px solid ${c.remake ? 'rgba(248, 113, 113, 0.3)' : 'rgba(120, 180, 255, 0.12)'}` }}
            title={t.remake}
          >
            <RefreshCw size={11} color={c.remake ? '#f87171' : 'var(--text-3)'} />
          </button>
          <button
            onClick={() => removeItemUndo('cases', c.id, c.caseId)}
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ background: 'rgba(248, 113, 113, 0.06)', border: '1px solid rgba(248, 113, 113, 0.15)' }}
          >
            <Trash2 size={11} color="#f87171" />
          </button>
        </div>
      </div>
    );
  })
)}

  </div>

{showQrCase && <CaseDetailModal caseData={showQrCase} ctx={ctx} onClose={() => setShowQrCase(null)} />}
{showIntakeModal && <CaseIntakeModal ctx={ctx} onClose={() => setShowIntakeModal(false)} onSave={handleSaveCase} />}

</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  INVENTORY VIEW
// ═══════════════════════════════════════════════════════════════════════
function InventoryView({ ctx }) {
const { state, t, lang, setField, addItem, removeItem, getName } = ctx;
const [showOnlyLow, setShowOnlyLow] = useState(false);

const filtered = state.inventory.filter(i => !showOnlyLow || i.stock <= i.reorderAt);
const lowCount = state.inventory.filter(i => i.stock <= i.reorderAt).length;
const totalValue = state.inventory.reduce((s, i) => s + i.stock * i.unitPrice, 0);

const categoryColors = {
zirconia: '#0891b2', emax: '#a78bfa', implant: '#f5b942',
pmma: '#06b6d4', consumable: '#34d399', tool: '#f472b6'
};

const handleAdd = () => {
addItem('inventory', {
name_ar: lang === 'ar' ? 'مادة جديدة' : 'New Item', name_en: 'New Item',
stock: 0, reorderAt: 5, unitPrice: 0, supplier: '', category: 'consumable'
});
};

return (

<div className="space-y-5">
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
<MiniStat label={lang === 'ar' ? 'إجمالي المواد' : 'Total Items'} value={state.inventory.length} subLabel={lang === 'ar' ? 'عنصر' : 'items'} color="#0891b2" icon={Boxes} />
<MiniStat label={lang === 'ar' ? 'قيمة المخزون' : 'Stock Value'} value={fmt(totalValue)} subLabel="KD" color="#34d399" icon={DollarSign} />
<MiniStat label={lang === 'ar' ? 'مخزون منخفض' : 'Low Stock'} value={lowCount} subLabel={lang === 'ar' ? 'يحتاج طلب' : 'need reorder'} color={lowCount > 0 ? '#f87171' : '#34d399'} icon={AlertTriangle} />
<MiniStat label={lang === 'ar' ? 'الموردون' : 'Suppliers'} value={new Set(state.inventory.map(i => i.supplier)).size} subLabel={lang === 'ar' ? 'فريد' : 'unique'} color="#a78bfa" icon={Users} />
</div>

  <div className="glass rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => setShowOnlyLow(!showOnlyLow)}
        className={`tab-btn ${showOnlyLow ? 'active' : ''}`}
      >
        <AlertTriangle size={12} className="inline" />
        {' '}{t.lowStock} ({lowCount})
      </button>
      <button onClick={() => setShowOnlyLow(false)} className={`tab-btn ${!showOnlyLow ? 'active' : ''}`}>
        {lang === 'ar' ? 'الكل' : 'All'} ({state.inventory.length})
      </button>
    </div>
    <button onClick={handleAdd} className="btn btn-primary">
      <Plus size={14} />
      {t.addNew}
    </button>
  </div>

  <div className="glass rounded-2xl overflow-hidden">
    <div className="overflow-x-auto scroll-y">
      <table className="w-full" style={{ fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: 'rgba(241, 245, 249, 0.7)' }}>
            <th className="px-4 py-3 text-[10.5px] uppercase font-bold tracking-widest text-start" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>
              {lang === 'ar' ? 'الصنف' : 'Item'}
            </th>
            <th className="px-3 py-3 text-[10.5px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)' }}>{t.stock}</th>
            <th className="px-3 py-3 text-[10.5px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)' }}>{t.reorderAt}</th>
            <th className="px-3 py-3 text-[10.5px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'سعر' : 'Unit Price'}</th>
            <th className="px-3 py-3 text-[10.5px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'القيمة' : 'Value'}</th>
            <th className="px-3 py-3 text-[10.5px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)' }}>{t.supplier}</th>
            <th className="px-3 py-3 text-[10.5px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)' }}>{t.status}</th>
            <th className="px-3 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(it => {
            const isLow = it.stock <= it.reorderAt;
            const isOut = it.stock === 0;
            const c = categoryColors[it.category] || '#94a3c4';
            return (
              <tr key={it.id} className="border-t" style={{ borderColor: 'rgba(120, 180, 255, 0.06)' }}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
                    <input
                      className="themed font-semibold" value={getName(it)}
                      style={{ padding: '4px 8px', fontSize: 12.5, textAlign: 'start', minWidth: 180 }}
                      onChange={e => setField('inventory', it.id, 'name', e.target.value)}
                    />
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <input type="number" className="themed mono w-20" value={it.stock}
                    style={{ padding: '4px 6px', fontSize: 12 }}
                    onChange={e => setField('inventory', it.id, 'stock', e.target.value)} />
                </td>
                <td className="px-3 py-2.5 text-center">
                  <input type="number" className="themed mono w-20" value={it.reorderAt}
                    style={{ padding: '4px 6px', fontSize: 12 }}
                    onChange={e => setField('inventory', it.id, 'reorderAt', e.target.value)} />
                </td>
                <td className="px-3 py-2.5 text-center">
                  <input type="number" className="themed mono w-24" value={it.unitPrice}
                    style={{ padding: '4px 6px', fontSize: 12 }}
                    onChange={e => setField('inventory', it.id, 'unitPrice', e.target.value)} />
                </td>
                <td className="px-3 py-2.5 text-center mono font-semibold" style={{ color: 'var(--text)' }}>
                  {fmt(it.stock * it.unitPrice)} KD
                </td>
                <td className="px-3 py-2.5">
                  <input className="themed text-[11.5px]" value={it.supplier || ''}
                    style={{ padding: '4px 8px', fontSize: 11.5, textAlign: 'start' }}
                    onChange={e => setField('inventory', it.id, 'supplier', e.target.value)} />
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest" style={{
                    background: isOut ? 'rgba(248, 113, 113, 0.15)' : isLow ? 'rgba(245, 185, 66, 0.15)' : 'rgba(52, 211, 153, 0.12)',
                    color: isOut ? '#f87171' : isLow ? '#f5b942' : '#34d399',
                  }}>
                    {isOut ? t.outOfStock : isLow ? t.lowStock : t.inStock}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => removeItem('inventory', it.id)}
                    className="w-7 h-7 rounded flex items-center justify-center"
                    style={{ background: 'rgba(248, 113, 113, 0.06)', border: '1px solid rgba(248, 113, 113, 0.15)' }}
                  >
                    <Trash2 size={11} color="#f87171" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  TECHNICIANS VIEW (with room assignment)
// ═══════════════════════════════════════════════════════════════════════
function TechniciansView({ ctx }) {
const { state, t, lang, setField, addItem, removeItem, getName } = ctx;

const totalSalary = state.technicians.reduce((s, tech) => s + tech.salary, 0);
const totalOutput = state.technicians.reduce((s, tech) => s + tech.monthlyOutput, 0);
const avgEfficiency = state.technicians.length > 0
? state.technicians.reduce((s, tech) => s + tech.efficiency, 0) / state.technicians.length
: 0;

const handleAdd = () => {
addItem('technicians', {
name_ar: lang === 'ar' ? 'فني جديد' : 'New Technician',
name_en: 'New Technician',
role: 'CAD/CAM', salary: 0, monthlyOutput: 0, efficiency: 80,
specialty: 'zirconia', room: 'digital'
});
};

return (

<div className="space-y-5">
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
<MiniStat label={lang === 'ar' ? 'إجمالي الفنيين' : 'Total Techs'} value={state.technicians.length} subLabel={lang === 'ar' ? 'موظف' : 'staff'} color="#0891b2" icon={Users} />
<MiniStat label={lang === 'ar' ? 'إجمالي الرواتب' : 'Total Payroll'} value={fmt(totalSalary)} subLabel={`KD ${t.perMonth}`} color="#f5b942" icon={DollarSign} />
<MiniStat label={lang === 'ar' ? 'الإنتاج الإجمالي' : 'Total Output'} value={fmt(totalOutput)} subLabel={`${t.units_short}/${t.perMonth}`} color="#34d399" icon={Activity} />
<MiniStat label={lang === 'ar' ? 'متوسط الكفاءة' : 'Avg Efficiency'} value={`${fmt2(avgEfficiency)}%`} subLabel="" color="#a78bfa" icon={TrendingUp} />
</div>

  <div className="flex justify-end">
    <button onClick={handleAdd} className="btn btn-primary">
      <Plus size={14} />
      {lang === 'ar' ? 'إضافة فني' : 'Add Technician'}
    </button>
  </div>

  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
    {state.technicians.map(tech => {
      const r = ROOM_MAP[tech.room] || ROOM_MAP['processing'];
      return (
        <div key={tech.id} className="glass rounded-2xl p-5 data-card">
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}
            >
              <span className="text-lg font-bold" style={{ color: '#ffffff' }}>
                {getName(tech).charAt(0).toUpperCase()}
              </span>
              {tech.efficiency >= 95 && (
                <Crown size={11} className="absolute -top-1 -right-1" color="#f5b942" fill="#f5b942" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <input
                className="themed font-bold" value={getName(tech)}
                style={{ padding: '4px 8px', fontSize: 14, textAlign: 'start', fontWeight: 700, background: 'transparent', border: '1px solid transparent', color: 'var(--text)' }}
                onChange={e => setField('technicians', tech.id, 'name', e.target.value)}
              />
              <input
                className="themed text-[11.5px]" value={tech.role}
                style={{ padding: '2px 8px', fontSize: 11.5, textAlign: 'start', background: 'transparent', border: '1px solid transparent', color: 'var(--text-2)' }}
                onChange={e => setField('technicians', tech.id, 'role', e.target.value)}
              />
            </div>
            <button
              onClick={() => removeItem('technicians', tech.id)}
              className="w-7 h-7 rounded flex items-center justify-center"
              style={{ background: 'rgba(248, 113, 113, 0.06)', border: '1px solid rgba(248, 113, 113, 0.15)' }}
            >
              <Trash2 size={11} color="#f87171" />
            </button>
          </div>

      {/* Room assignment */}
      <div className="mb-3">
        <div className="text-[10.5px] uppercase font-bold tracking-widest mb-1.5" style={{ color: 'var(--text-3)' }}>
          {t.assignedRoom}
        </div>
        <select
          value={tech.room}
          onChange={e => setField('technicians', tech.id, 'room', e.target.value)}
          className="themed w-full"
          style={{ fontSize: 12.5, padding: '6px 10px' }}
        >
          {ROOMS.map(room => (
            <option key={room.id} value={room.id}>
              {room.num} · {lang === 'ar' ? room.ar : room.en}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1.5 mt-1.5 text-[10.5px]" style={{ color: r.color }}>
          <r.icon size={10} />
          <span>{lang === 'ar' ? r.ar : r.en}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10.5px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)', letterSpacing: '0.1em' }}>{t.efficiency}</span>
          <span className="mono text-sm font-bold" style={{ color: tech.efficiency >= 90 ? '#34d399' : tech.efficiency >= 75 ? '#f5b942' : '#f87171' }}>
            {tech.efficiency}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(120, 180, 255, 0.08)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${tech.efficiency}%`,
              background: tech.efficiency >= 90 ? '#34d399' : tech.efficiency >= 75 ? '#f5b942' : '#f87171',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(241, 245, 249, 0.7)' }}>
          <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-3)' }}>{t.salary}</div>
          <input
            type="number" className="themed mono w-full"
            value={tech.salary}
            style={{ padding: '2px', fontSize: 12, textAlign: 'center', background: 'transparent', border: 'none' }}
            onChange={e => setField('technicians', tech.id, 'salary', e.target.value)}
          />
        </div>
        <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(241, 245, 249, 0.7)' }}>
          <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-3)' }}>{t.monthlyOutput}</div>
          <input
            type="number" className="themed mono w-full"
            value={tech.monthlyOutput}
            style={{ padding: '2px', fontSize: 12, textAlign: 'center', background: 'transparent', border: 'none' }}
            onChange={e => setField('technicians', tech.id, 'monthlyOutput', e.target.value)}
          />
        </div>
        <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(241, 245, 249, 0.7)' }}>
          <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-3)' }}>{t.efficiency}</div>
          <input
            type="number" className="themed mono w-full"
            value={tech.efficiency} max="100"
            style={{ padding: '2px', fontSize: 12, textAlign: 'center', background: 'transparent', border: 'none' }}
            onChange={e => setField('technicians', tech.id, 'efficiency', e.target.value)}
          />
        </div>
      </div>

      {/* Active cases for this tech */}
      <div className="pt-2 border-t" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
        <div className="text-[10.5px]" style={{ color: 'var(--text-3)' }}>
          {t.workingOn}: <span className="mono font-bold" style={{ color: r.color }}>
            {state.cases.filter(c => c.currentRoom === tech.room && c.status !== 'delivered').length}
          </span> {lang === 'ar' ? 'حالة' : 'cases'}
        </div>
      </div>
    </div>
  );
})}

  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  ACCOUNTING SETTINGS TAB (Currency + VAT)
// ═══════════════════════════════════════════════════════════════════════
function AccountingSettingsTab({ ctx }) {
const { state, setState, t, lang } = ctx;

const updateCurrencyRate = (code, newRate) => {
setState(s => ({
...s,
currencies: s.currencies.map(c => c.code === code ? { ...c, rate: Number(newRate) || 0 } : c)
}));
};

const setDefaultCurrency = (code) => {
setState(s => ({ ...s, defaultCurrency: code }));
};

const toggleVat = () => {
setState(s => ({ ...s, vatEnabled: !s.vatEnabled }));
};

const updateVatRate = (rate) => {
setState(s => ({ ...s, vatDefaultRate: Number(rate) || 0 }));
};

const updateVatNumber = (num) => {
setState(s => ({ ...s, vatNumber: num }));
};

return (
<div className="space-y-4">
{/* Currency Settings */}
<div className="glass rounded-xl overflow-hidden">
<div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
<DollarSign size={14} color="#34d399" />
<span className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>{t.currencySettings}</span>
</div>
<div className="p-4 space-y-3">
<div>
<label className="block text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-3)' }}>
{t.defaultCurrency}
</label>
<select value={state.defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)} className="themed w-full">
{state.currencies.map(c => (
<option key={c.code} value={c.code}>{c.code} - {lang === 'ar' ? c.name_ar : c.name_en} ({c.symbol})</option>
))}
</select>
</div>

      <div>
        <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-3)' }}>
          {t.exchangeRate} (1 KD = ?)
        </div>
        <div className="space-y-2">
          {state.currencies.filter(c => c.code !== 'KD').map(c => (
            <div key={c.code} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(120, 180, 255, 0.08)' }}>
              <div className="w-12 mono font-bold text-[12px]" style={{ color: '#0891b2' }}>{c.code}</div>
              <div className="flex-1 text-[11px]" style={{ color: 'var(--text-2)' }}>{lang === 'ar' ? c.name_ar : c.name_en}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>= 1 KD ×</span>
                <input 
                  type="number" 
                  value={c.rate} 
                  onChange={e => updateCurrencyRate(c.code, e.target.value)}
                  step="0.001"
                  className="themed mono text-right"
                  style={{ width: 90, padding: '4px 8px' }}
                />
                <span className="mono text-[11px]" style={{ color: 'var(--text-2)' }}>{c.symbol}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-[10px] mt-2" style={{ color: 'var(--text-3)' }}>
          {lang === 'ar' ? '💡 يمكنك تحديث الأسعار يدوياً حسب سعر الصرف الحالي' : '💡 Update rates manually based on current exchange rates'}
        </div>
      </div>
    </div>
  </div>
  
  {/* VAT Settings */}
  <div className="glass rounded-xl overflow-hidden">
    <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
      <FileText size={14} color="#a78bfa" />
      <span className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>{t.vatSettings}</span>
    </div>
    <div className="p-4 space-y-3">
      {/* Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(120, 180, 255, 0.08)' }}>
        <div>
          <div className="text-[12px] font-semibold" style={{ color: 'var(--text)' }}>{t.vatEnabled}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>
            {state.vatEnabled 
              ? (lang === 'ar' ? '✓ مفعل - يطبق على الفواتير الجديدة' : '✓ Enabled - applies to new invoices')
              : (lang === 'ar' ? 'معطل' : 'Disabled')}
          </div>
        </div>
        <button 
          onClick={toggleVat}
          className="relative w-12 h-7 rounded-full transition"
          style={{ background: state.vatEnabled ? 'rgba(52, 211, 153, 0.4)' : 'rgba(100, 116, 139, 0.3)' }}
        >
          <div 
            className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all"
            style={{ left: state.vatEnabled ? '24px' : '4px' }}
          />
        </button>
      </div>
      
      {/* VAT Rate */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-3)' }}>
          {t.vatDefaultRate}
        </label>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            value={state.vatDefaultRate} 
            onChange={e => updateVatRate(e.target.value)}
            step="0.5"
            min="0"
            max="100"
            disabled={!state.vatEnabled}
            className="themed mono"
            style={{ width: 100 }}
          />
          <span className="text-[12px]" style={{ color: 'var(--text-2)' }}>%</span>
          {/* Quick presets */}
          <div className="flex gap-1 ml-auto">
            {[0, 5, 10, 15, 16].map(rate => (
              <button
                key={rate}
                onClick={() => updateVatRate(rate)}
                disabled={!state.vatEnabled}
                className="px-2 py-1 rounded text-[10px] font-bold mono transition"
                style={{
                  background: state.vatDefaultRate === rate ? 'rgba(167, 139, 250, 0.2)' : 'rgba(241, 245, 249, 0.7)',
                  color: state.vatDefaultRate === rate ? '#a78bfa' : 'var(--text-3)',
                  border: `1px solid ${state.vatDefaultRate === rate ? 'rgba(167, 139, 250, 0.4)' : 'rgba(120, 180, 255, 0.1)'}`,
                  opacity: state.vatEnabled ? 1 : 0.5,
                }}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* VAT Number */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-3)' }}>
          {t.vatNumber}
        </label>
        <input 
          type="text" 
          value={state.vatNumber || ''} 
          onChange={e => updateVatNumber(e.target.value)}
          disabled={!state.vatEnabled}
          className="themed w-full"
          placeholder={lang === 'ar' ? 'مثال: 300012345600003' : 'e.g. 300012345600003'}
        />
        <div className="text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>
          {lang === 'ar' ? '💡 يظهر على كل الفواتير المطبوعة' : '💡 Appears on all printed invoices'}
        </div>
      </div>
    </div>
  </div>
  
  {/* Info */}
  <div className="p-3 rounded-lg" style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
    <div className="text-[11px]" style={{ color: 'var(--text-2)' }}>
      {lang === 'ar' 
        ? '💡 العملة الأساسية للنظام KD. يمكنك إنشاء الفواتير بعملة أخرى وسيتم التحويل تلقائياً. أسعار الصرف للعرض فقط - حدث القيم حسب سعر السوق الحالي.' 
        : '💡 The system base currency is KD. You can create invoices in other currencies with automatic conversion. Exchange rates are for display - update them based on current market rates.'}
    </div>
  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  REPORTS HELPER FUNCTIONS (Excel + PDF export)
// ═══════════════════════════════════════════════════════════════════════

// Helper: Export invoices array to Excel file
const exportInvoicesToExcel = (invoices, payments, filename, title, lang) => {
const wb = XLSX.utils.book_new();

// Sheet 1: Summary
const summary = [
[title],
[],
[lang === 'ar' ? 'تاريخ التقرير' : 'Report Date', new Date().toLocaleDateString()],
[lang === 'ar' ? 'عدد الفواتير' : 'Invoices', invoices.length],
[lang === 'ar' ? 'الإجمالي' : 'Total', invoices.reduce((s, i) => s + (i.total || 0), 0)],
[lang === 'ar' ? 'المدفوع' : 'Paid', invoices.reduce((s, i) => s + (i.paid || 0), 0)],
[lang === 'ar' ? 'المستحق' : 'Outstanding', invoices.reduce((s, i) => s + (i.balance || 0), 0)],
];
const summarySheet = XLSX.utils.aoa_to_sheet(summary);
summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, summarySheet, lang === 'ar' ? 'ملخص' : 'Summary');

// Sheet 2: Invoices detail
const invoiceRows = invoices.map(inv => ({
[lang === 'ar' ? 'رقم الفاتورة' : 'Invoice #']: inv.invoiceNumber,
[lang === 'ar' ? 'التاريخ' : 'Date']: inv.date,
[lang === 'ar' ? 'الاستحقاق' : 'Due Date']: inv.dueDate,
[lang === 'ar' ? 'العيادة' : 'Clinic']: inv.clinic || '',
[lang === 'ar' ? 'الطبيب' : 'Doctor']: inv.doctorName || '',
[lang === 'ar' ? 'الحالة' : 'Status']: inv.status,
[lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal']: inv.subtotal || 0,
[lang === 'ar' ? 'الخصم' : 'Discount']: inv.discount || 0,
[lang === 'ar' ? 'الضريبة' : 'Tax']: inv.tax || 0,
[lang === 'ar' ? 'الإجمالي' : 'Total']: inv.total || 0,
[lang === 'ar' ? 'المدفوع' : 'Paid']: inv.paid || 0,
[lang === 'ar' ? 'الرصيد' : 'Balance']: inv.balance || 0,
}));
const invSheet = XLSX.utils.json_to_sheet(invoiceRows);
invSheet['!cols'] = Array(12).fill({ wch: 15 });
XLSX.utils.book_append_sheet(wb, invSheet, lang === 'ar' ? 'الفواتير' : 'Invoices');

// Sheet 3: Payments (if any)
if (payments && payments.length > 0) {
const payRows = payments.map(p => ({
[lang === 'ar' ? 'التاريخ' : 'Date']: p.date,
[lang === 'ar' ? 'رقم الفاتورة' : 'Invoice #']: invoices.find(i => i.id === p.invoiceId)?.invoiceNumber || '',
[lang === 'ar' ? 'المبلغ' : 'Amount']: p.amount,
[lang === 'ar' ? 'الطريقة' : 'Method']: p.method,
[lang === 'ar' ? 'المرجع' : 'Reference']: p.reference || '',
}));
const paySheet = XLSX.utils.json_to_sheet(payRows);
paySheet['!cols'] = Array(5).fill({ wch: 15 });
XLSX.utils.book_append_sheet(wb, paySheet, lang === 'ar' ? 'المدفوعات' : 'Payments');
}

XLSX.writeFile(wb, filename);
};

// Helper: Print invoices as PDF (via browser print)
const printInvoicesReport = (invoices, title, subtitle, lang, fmt2) => {
const w = window.open('', '_blank');
if (!w) return;

const totalSum = invoices.reduce((s, i) => s + (i.total || 0), 0);
const paidSum = invoices.reduce((s, i) => s + (i.paid || 0), 0);
const balanceSum = invoices.reduce((s, i) => s + (i.balance || 0), 0);

const statusBadge = (status) => {
const colors = { paid: ['#dcfce7', '#16a34a'], sent: ['#dbeafe', '#2563eb'], partial: ['#ede9fe', '#7c3aed'], overdue: ['#fee2e2', '#dc2626'], draft: ['#f3f4f6', '#6b7280'], cancelled: ['#fef2f2', '#991b1b'] };
const [bg, color] = colors[status] || ['#f3f4f6', '#6b7280'];
return `<span style="background:${bg};color:${color};padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;">${status}</span>`;
};

const rows = invoices.map((inv, idx) => `<tr style="${idx % 2 === 0 ? 'background:#fafafa;' : ''}"> <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-weight:700;color:#0ea5e9;">${inv.invoiceNumber}</td> <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${inv.date}</td> <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${inv.clinic || '—'}</td> <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${inv.doctorName || '—'}</td> <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${statusBadge(inv.status)}</td> <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace;font-weight:600;">${fmt2(inv.total)} KD</td> <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace;color:#16a34a;">${fmt2(inv.paid)} KD</td> <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace;font-weight:700;color:${inv.balance > 0 ? '#dc2626' : '#16a34a'};">${fmt2(inv.balance)} KD</td> </tr>`).join('');

w.document.write(`<!DOCTYPE html>

<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<style>
* { box-sizing: border-box; }
body { font-family: ${lang === 'ar' ? '"Tajawal", system-ui, sans-serif' : '"Manrope", system-ui, sans-serif'}; margin: 0; padding: 25px; background: #fff; color: #1a1a1a; }
.report { max-width: 1100px; margin: 0 auto; }
.header { padding-bottom: 16px; border-bottom: 3px solid #1a1a1a; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
.header h1 { margin: 0; font-size: 22px; letter-spacing: 0.3px; }
.header .sub { font-size: 12px; color: #666; margin-top: 4px; }
.header .meta { text-align: ${lang === 'ar' ? 'left' : 'right'}; font-size: 11px; color: #666; }
.summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
.summary-card { padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; }
.summary-card .lbl { font-size: 10px; text-transform: uppercase; color: #666; letter-spacing: 1px; }
.summary-card .val { font-size: 18px; font-weight: 700; font-family: monospace; margin-top: 4px; }
table { width: 100%; border-collapse: collapse; font-size: 11px; }
table thead { background: #1a1a1a; color: #fff; }
table th { padding: 10px 8px; text-align: ${lang === 'ar' ? 'right' : 'left'}; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
table th.right { text-align: ${lang === 'ar' ? 'left' : 'right'}; }
table th.center { text-align: center; }
.totals-row { background: #1a1a1a !important; color: #fff; font-weight: 700; }
.totals-row td { padding: 10px 8px; font-family: monospace; }
.footer { margin-top: 30px; padding-top: 12px; border-top: 1px dashed #999; text-align: center; font-size: 10px; color: #888; }
@media print { body { padding: 0; } @page { size: A4 landscape; margin: 10mm; } }
</style>
</head>
<body>
<div class="report">
  <div class="header">
    <div>
      <h1>${title}</h1>
      <div class="sub">${subtitle}</div>
    </div>
    <div class="meta">
      <div><strong>Evora Dental Lab</strong></div>
      <div>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
    </div>
  </div>

  <div class="summary">
    <div class="summary-card"><div class="lbl">${lang === 'ar' ? 'عدد الفواتير' : 'Invoices'}</div><div class="val">${invoices.length}</div></div>
    <div class="summary-card" style="border-color:#bae6fd;background:#f0f9ff;"><div class="lbl">${lang === 'ar' ? 'الإجمالي' : 'Total'}</div><div class="val" style="color:#0ea5e9;">${fmt2(totalSum)} KD</div></div>
    <div class="summary-card" style="border-color:#bbf7d0;background:#f0fdf4;"><div class="lbl">${lang === 'ar' ? 'المدفوع' : 'Paid'}</div><div class="val" style="color:#16a34a;">${fmt2(paidSum)} KD</div></div>
    <div class="summary-card" style="border-color:#fecaca;background:#fef2f2;"><div class="lbl">${lang === 'ar' ? 'المستحق' : 'Outstanding'}</div><div class="val" style="color:#dc2626;">${fmt2(balanceSum)} KD</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>${lang === 'ar' ? 'الرقم' : 'Invoice #'}</th>
        <th>${lang === 'ar' ? 'التاريخ' : 'Date'}</th>
        <th>${lang === 'ar' ? 'العيادة' : 'Clinic'}</th>
        <th>${lang === 'ar' ? 'الطبيب' : 'Doctor'}</th>
        <th class="center">${lang === 'ar' ? 'الحالة' : 'Status'}</th>
        <th class="right">${lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
        <th class="right">${lang === 'ar' ? 'المدفوع' : 'Paid'}</th>
        <th class="right">${lang === 'ar' ? 'الرصيد' : 'Balance'}</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="totals-row">
        <td colspan="5" style="text-align:${lang === 'ar' ? 'right' : 'left'};text-transform:uppercase;letter-spacing:1px;">${lang === 'ar' ? 'الإجمالي' : 'Total'}</td>
        <td style="text-align:right;">${fmt2(totalSum)} KD</td>
        <td style="text-align:right;">${fmt2(paidSum)} KD</td>
        <td style="text-align:right;">${fmt2(balanceSum)} KD</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">${lang === 'ar' ? 'تم الإنشاء بواسطة' : 'Generated by'} Evora Dental Lab Accounting System</div>
</div>
<script>setTimeout(() => window.print(), 500);</script>
</body>
</html>`);
  w.document.close();
};

// ═══════════════════════════════════════════════════════════════════════
//  REPORTS TAB COMPONENT (used inside AccountingView)
// ═══════════════════════════════════════════════════════════════════════
function ReportsTab({ ctx }) {
const { state, t, lang, fmt2, showToast } = ctx;
const [reportType, setReportType] = useState('monthly'); // 'monthly' | 'clinic' | 'all'
const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
const [selectedClinic, setSelectedClinic] = useState('');

// Get unique clinics
const clinics = useMemo(() => {
const set = new Set(state.invoices.map(i => i.clinic).filter(Boolean));
return Array.from(set).sort();
}, [state.invoices]);

// Filter invoices based on report type
const filteredInvoices = useMemo(() => {
if (reportType === 'monthly') {
return state.invoices.filter(i => (i.date || '').startsWith(selectedMonth));
} else if (reportType === 'clinic') {
if (!selectedClinic) return [];
return state.invoices.filter(i => i.clinic === selectedClinic);
} else {
return state.invoices;
}
}, [state.invoices, reportType, selectedMonth, selectedClinic]);

// Related payments
const relatedPayments = useMemo(() => {
const invIds = new Set(filteredInvoices.map(i => i.id));
return state.payments.filter(p => invIds.has(p.invoiceId));
}, [filteredInvoices, state.payments]);

// Summary metrics
const summary = useMemo(() => ({
count: filteredInvoices.length,
total: filteredInvoices.reduce((s, i) => s + (i.total || 0), 0),
paid: filteredInvoices.reduce((s, i) => s + (i.paid || 0), 0),
balance: filteredInvoices.reduce((s, i) => s + (i.balance || 0), 0),
}), [filteredInvoices]);

// Get report title
const getReportTitle = () => {
if (reportType === 'monthly') {
const [year, month] = selectedMonth.split('-');
const monthNames = lang === 'ar'
? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
: ['January','February','March','April','May','June','July','August','September','October','November','December'];
return `${lang === 'ar' ? 'تقرير' : 'Report'} - ${monthNames[parseInt(month) - 1]} ${year}`;
} else if (reportType === 'clinic') {
return `${lang === 'ar' ? 'تقرير عيادة' : 'Clinic Report'} - ${selectedClinic || '—'}`;
} else {
return lang === 'ar' ? 'تقرير كل الفواتير' : 'All Invoices Report';
}
};

const getReportSubtitle = () => {
if (reportType === 'monthly') return lang === 'ar' ? `جميع الفواتير لشهر ${selectedMonth}` : `All invoices for ${selectedMonth}`;
if (reportType === 'clinic') return lang === 'ar' ? `كشف حساب كامل` : `Full account statement`;
return lang === 'ar' ? 'كامل سجل الفواتير' : 'Complete invoice history';
};

const handleExportExcel = () => {
if (filteredInvoices.length === 0) {
showToast('warning', lang === 'ar' ? 'لا توجد فواتير للتصدير' : 'No invoices to export');
return;
}
const filename = `${getReportTitle().replace(/[^a-zA-Z0-9\-_\s]/g, '_').replace(/\s+/g, '_')}.xlsx`;
exportInvoicesToExcel(filteredInvoices, relatedPayments, filename, getReportTitle(), lang);
};

const handleExportPdf = () => {
if (filteredInvoices.length === 0) {
showToast('warning', lang === 'ar' ? 'لا توجد فواتير للتصدير' : 'No invoices to export');
return;
}
printInvoicesReport(filteredInvoices, getReportTitle(), getReportSubtitle(), lang, fmt2);
};

return (
<div className="space-y-4">
{/* Report type selector */}
<div className="glass rounded-xl p-3">
<div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-3)' }}>
{lang === 'ar' ? 'نوع التقرير' : 'Report Type'}
</div>
<div className="grid grid-cols-3 gap-2">
{[
{ id: 'monthly', label: t.monthlyReport, icon: Calendar, color: '#0891b2' },
{ id: 'clinic', label: t.clinicReport, icon: Stethoscope, color: '#a78bfa' },
{ id: 'all', label: t.allInvoicesReport, icon: FileText, color: '#34d399' },
].map(r => {
const Icon = r.icon;
const active = reportType === r.id;
return (
<button
key={r.id}
onClick={() => setReportType(r.id)}
className="p-3 rounded-lg flex flex-col items-center gap-1.5 transition"
style={{
background: active ? `${r.color}15` : 'rgba(241, 245, 249, 0.7)',
border: `1px solid ${active ? r.color + '40' : 'rgba(120, 180, 255, 0.1)'}`,
boxShadow: active ? `0 0 16px ${r.color}25` : 'none',
}}
>
<Icon size={16} color={active ? r.color : 'var(--text-3)'} />
<span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: active ? r.color : 'var(--text-2)' }}>
{r.label}
</span>
</button>
);
})}
</div>
</div>

  {/* Filter UI */}
  <div className="glass rounded-xl p-3">
    {reportType === 'monthly' && (
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-3)' }}>
          {t.selectMonth}
        </label>
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="themed w-full"
        />
      </div>
    )}
    {reportType === 'clinic' && (
      <div>
        <label className="block text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-3)' }}>
          {t.selectClinic}
        </label>
        <select
          value={selectedClinic}
          onChange={e => setSelectedClinic(e.target.value)}
          className="themed w-full"
        >
          <option value="">{lang === 'ar' ? '— اختر —' : '— Select —'}</option>
          {clinics.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {clinics.length === 0 && (
          <div className="text-[10px] mt-1" style={{ color: '#f5b942' }}>
            {lang === 'ar' ? '⚠️ لا توجد عيادات بعد' : '⚠️ No clinics yet'}
          </div>
        )}
      </div>
    )}
    {reportType === 'all' && (
      <div className="text-[11px] text-center py-2" style={{ color: 'var(--text-3)' }}>
        {lang === 'ar' ? `سيتم تصدير ${state.invoices.length} فاتورة` : `Will export ${state.invoices.length} invoices`}
      </div>
    )}
  </div>
  
  {/* Summary stats */}
  {filteredInvoices.length > 0 && (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      <div className="glass rounded-lg p-3" style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
        <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{t.totalInvoicesInPeriod}</div>
        <div className="mono font-bold text-lg" style={{ color: '#0891b2' }}>{summary.count}</div>
      </div>
      <div className="glass rounded-lg p-3" style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
        <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{t.periodRevenue}</div>
        <div className="mono font-bold text-lg" style={{ color: '#0891b2' }}>{fmt2(summary.total)} KD</div>
      </div>
      <div className="glass rounded-lg p-3" style={{ background: 'rgba(52, 211, 153, 0.06)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
        <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{t.periodCollected}</div>
        <div className="mono font-bold text-lg" style={{ color: '#34d399' }}>{fmt2(summary.paid)} KD</div>
      </div>
      <div className="glass rounded-lg p-3" style={{ background: 'rgba(248, 113, 113, 0.06)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
        <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{t.periodOutstanding}</div>
        <div className="mono font-bold text-lg" style={{ color: '#f87171' }}>{fmt2(summary.balance)} KD</div>
      </div>
    </div>
  )}
  
  {/* Export buttons */}
  <div className="grid grid-cols-2 gap-2">
    <button
      onClick={handleExportPdf}
      disabled={filteredInvoices.length === 0}
      className="btn"
      style={{
        background: filteredInvoices.length === 0 ? 'rgba(100, 100, 100, 0.15)' : 'rgba(248, 113, 113, 0.15)',
        border: filteredInvoices.length === 0 ? '1px solid rgba(100, 100, 100, 0.2)' : '1px solid rgba(248, 113, 113, 0.3)',
        color: filteredInvoices.length === 0 ? 'var(--text-3)' : '#f87171',
        justifyContent: 'center',
      }}
    >
      <Printer size={14} />
      {t.exportPdf}
    </button>
    <button
      onClick={handleExportExcel}
      disabled={filteredInvoices.length === 0}
      className="btn"
      style={{
        background: filteredInvoices.length === 0 ? 'rgba(100, 100, 100, 0.15)' : 'rgba(52, 211, 153, 0.15)',
        border: filteredInvoices.length === 0 ? '1px solid rgba(100, 100, 100, 0.2)' : '1px solid rgba(52, 211, 153, 0.3)',
        color: filteredInvoices.length === 0 ? 'var(--text-3)' : '#34d399',
        justifyContent: 'center',
      }}
    >
      <FileSpreadsheet size={14} />
      {t.exportExcel}
    </button>
  </div>
  
  {/* Preview */}
  <div className="glass rounded-xl overflow-hidden">
    <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
      <span className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>{t.reportPreview}</span>
      <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{filteredInvoices.length} {lang === 'ar' ? 'فاتورة' : 'inv'}</span>
    </div>
    {filteredInvoices.length === 0 ? (
      <div className="text-center py-8 text-[12px]" style={{ color: 'var(--text-3)' }}>{t.noDataInPeriod}</div>
    ) : (
      <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: 'rgba(120, 180, 255, 0.05)' }}>
        {filteredInvoices.map(inv => (
          <div key={inv.id} className="px-4 py-2 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex-1 min-w-0">
              <span className="mono font-bold" style={{ color: '#0891b2' }}>{inv.invoiceNumber}</span>
              <span className="mx-2" style={{ color: 'var(--text-3)' }}>·</span>
              <span style={{ color: 'var(--text)' }}>{inv.clinic || '—'}</span>
            </div>
            <div className="mono font-bold" style={{ color: 'var(--text)' }}>{fmt2(inv.total)} KD</div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  PROFESSIONAL ACCOUNTING VIEW
// ═══════════════════════════════════════════════════════════════════════
function AccountingView({ ctx }) {
const { state, setState, t, lang, isRtl, addItem, removeItem, setField, fmt, fmt2, money, showToast, askConfirm } = ctx;
const [activeTab, setActiveTab] = useState('dashboard');
const [showAddExpense, setShowAddExpense] = useState(false);
const [editingInvoice, setEditingInvoice] = useState(null);
const [selectedClinic, setSelectedClinic] = useState(null);
const [recordingPayment, setRecordingPayment] = useState(null);
const [timeFilter, setTimeFilter] = useState('month');

// ─── Auto-generate invoices from cases (one-time on first load) ───
useEffect(() => {
if (state.invoices.length === 0 && state.cases.length > 0) {
const today = new Date().toISOString().split('T')[0];
const dueDays = 30;
const newInvoices = state.cases
.filter(c => c.status === 'delivered' || c.status === 'inProgress')
.map((c, idx) => {
const dueDate = new Date(c.date || today);
dueDate.setDate(dueDate.getDate() + dueDays);
const subtotal = (c.price || 0) * (c.units || 1);
// Apply the configured default VAT rate when VAT is enabled in settings.
const taxRate = state.vatEnabled ? (state.vatDefaultRate || 0) : 0;
const tax = subtotal * (taxRate / 100);
const total = subtotal + tax;
return {
id: uid(),
invoiceNumber: `INV-${new Date().getFullYear()}-${String(idx + 1).padStart(3, '0')}`,
caseId: c.caseId,
caseLinkId: c.id,
date: c.date || today,
dueDate: dueDate.toISOString().split('T')[0],
clinic: c.clinic || '',
doctorName: c.doctorName || '',
items: [{
id: uid(),
description: `${c.type || ''} - ${c.patient || ''} (${(c.teeth || []).join(',') || c.units + ' units'})`,
quantity: c.units || 1,
unitPrice: c.price || 0,
total: subtotal
}],
subtotal,
discountPct: 0,
discount: 0,
taxRate,
tax,
total,
paid: c.status === 'delivered' ? total : 0,
balance: c.status === 'delivered' ? 0 : total,
status: c.status === 'delivered' ? 'paid' : 'sent',
notes: c.notes || '',
createdAt: nowIso(),
};
});
if (newInvoices.length > 0) {
setState(s => ({ ...s, invoices: newInvoices, lastInvoiceNum: newInvoices.length }));
}
}
}, []);

// ─── Compute financial metrics ───
const metrics = useMemo(() => {
const today = new Date();
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
const filterByTime = (dateStr) => timeFilter === 'all' || (dateStr && dateStr >= monthStart);

const invoicesInPeriod = state.invoices.filter(inv => filterByTime(inv.date));
const totalBilled = invoicesInPeriod.reduce((s, i) => s + (i.total || 0), 0);
const totalCollected = invoicesInPeriod.reduce((s, i) => s + (i.paid || 0), 0);
const totalOutstanding = invoicesInPeriod.reduce((s, i) => s + (i.balance || 0), 0);
const overdueAmount = invoicesInPeriod
  .filter(i => i.balance > 0 && i.dueDate && i.dueDate < today.toISOString().split('T')[0])
  .reduce((s, i) => s + i.balance, 0);

const expensesInPeriod = state.expenses.filter(e => filterByTime(e.date));
const totalVarExpenses = expensesInPeriod.reduce((s, e) => s + (Number(e.amount) || 0), 0);

const monthlySalaries = state.salaries.reduce((s, e) => s + (e.count || 0) * (e.salary || 0), 0);
const monthlyFixed = state.fixed.reduce((s, e) => s + (Number(e.amount) || 0), 0);
const totalFixedMonthly = monthlySalaries + monthlyFixed;

const totalExpenses = totalVarExpenses + totalFixedMonthly;
const netProfit = totalCollected - totalExpenses;

return {
  totalBilled, totalCollected, totalOutstanding, overdueAmount,
  totalVarExpenses, totalFixedMonthly, totalExpenses, netProfit,
  invoicesInPeriod, expensesInPeriod
};

}, [state.invoices, state.expenses, state.salaries, state.fixed, timeFilter]);

// ─── Clinic balances aggregation ───
const clinicBalances = useMemo(() => {
const map = {};
state.invoices.forEach(inv => {
const key = inv.clinic || '—';
if (!map[key]) map[key] = { clinic: key, totalBilled: 0, totalPaid: 0, balance: 0, invoiceCount: 0, overdueAmount: 0, agingBuckets: { '0_30': 0, '31_60': 0, '61_90': 0, '90': 0 } };
map[key].totalBilled += inv.total || 0;
map[key].totalPaid += inv.paid || 0;
map[key].balance += inv.balance || 0;
map[key].invoiceCount += 1;
if (inv.balance > 0 && inv.dueDate) {
const days = Math.floor((new Date() - new Date(inv.dueDate)) / 86400000);
if (days > 90) map[key].agingBuckets['90'] += inv.balance;
else if (days > 60) map[key].agingBuckets['61_90'] += inv.balance;
else if (days > 30) map[key].agingBuckets['31_60'] += inv.balance;
else map[key].agingBuckets['0_30'] += inv.balance;
if (days > 0) map[key].overdueAmount += inv.balance;
}
});
return Object.values(map).sort((a, b) => b.balance - a.balance);
}, [state.invoices]);

// ─── Cash flow data for chart ───
const cashFlowData = useMemo(() => {
const buckets = {};
state.invoices.forEach(inv => {
const month = (inv.date || '').slice(0, 7);
if (!month) return;
if (!buckets[month]) buckets[month] = { month, income: 0, expenses: 0 };
buckets[month].income += inv.paid || 0;
});
state.expenses.forEach(e => {
const month = (e.date || '').slice(0, 7);
if (!month) return;
if (!buckets[month]) buckets[month] = { month, income: 0, expenses: 0 };
buckets[month].expenses += Number(e.amount) || 0;
});
return Object.values(buckets).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
}, [state.invoices, state.expenses]);

// ─── Status helpers ───
const statusColor = (status) => {
const map = {
paid: '#34d399', sent: '#0891b2', partial: '#a78bfa',
overdue: '#f87171', draft: '#94a3b8', cancelled: '#64748b'
};
return map[status] || '#94a3b8';
};

const statusLabel = (status) => ({
paid: t.paidStatus, sent: t.sentStatus, partial: t.partialPaid,
overdue: t.overdueStatus, draft: t.draftStatus, cancelled: t.cancelledStatus,
}[status] || status);

// ─── Generate next invoice number ───
const nextInvoiceNumber = () => {
const num = (state.lastInvoiceNum || 0) + 1;
return `INV-${new Date().getFullYear()}-${String(num).padStart(3, '0')}`;
};

// ─── Save invoice (new or updated) ───
const saveInvoice = (invoice) => {
const isNew = !state.invoices.find(i => i.id === invoice.id);
if (isNew) {
setState(s => ({
...s,
invoices: [...s.invoices, { ...invoice, createdAt: nowIso() }],
lastInvoiceNum: (s.lastInvoiceNum || 0) + 1
}));
} else {
setState(s => ({
...s,
invoices: s.invoices.map(i => i.id === invoice.id ? { ...invoice, updatedAt: nowIso() } : i)
}));
}
setEditingInvoice(null);
};

// ─── Delete invoice ───
const deleteInvoice = (id) => {
setState(s => ({
...s,
invoices: s.invoices.filter(i => i.id !== id),
payments: s.payments.filter(p => p.invoiceId !== id)
}));
};

// ─── Record payment ───
const recordPaymentFor = (invoice, payment) => {
const newPayment = { ...payment, id: uid(), invoiceId: invoice.id, createdAt: nowIso() };
const newPaid = (invoice.paid || 0) + Number(payment.amount);
const newBalance = (invoice.total || 0) - newPaid;
const newStatus = newBalance <= 0 ? 'paid' : newPaid > 0 ? 'partial' : invoice.status;

setState(s => ({
  ...s,
  payments: [...s.payments, newPayment],
  invoices: s.invoices.map(i => i.id === invoice.id ? {
    ...i, paid: newPaid, balance: newBalance, status: newStatus
  } : i)
}));
setRecordingPayment(null);

};

// ─── Manual generate invoices from cases ───
const generateFromCases = () => {
const existingCaseIds = new Set(state.invoices.map(i => i.caseLinkId).filter(Boolean));
const newCases = state.cases.filter(c => !existingCaseIds.has(c.id));
if (newCases.length === 0) {
showToast('warning', lang === 'ar' ? 'كل الحالات لها فواتير بالفعل' : 'All cases already have invoices');
return;
}
const today = new Date().toISOString().split('T')[0];
let counter = (state.lastInvoiceNum || 0) + 1;
const year = new Date().getFullYear();
const newInvoices = newCases.map((c) => {
const dueDate = new Date(c.date || today);
dueDate.setDate(dueDate.getDate() + 30);
const subtotal = (c.price || 0) * (c.units || 1);
// Apply the configured default VAT rate when VAT is enabled in settings.
const taxRate = state.vatEnabled ? (state.vatDefaultRate || 0) : 0;
const tax = subtotal * (taxRate / 100);
const total = subtotal + tax;
const inv = {
id: uid(),
invoiceNumber: `INV-${year}-${String(counter).padStart(3, '0')}`,
caseId: c.caseId, caseLinkId: c.id,
date: c.date || today,
dueDate: dueDate.toISOString().split('T')[0],
clinic: c.clinic || '', doctorName: c.doctorName || '',
items: [{
id: uid(),
description: `${c.type || ''} - ${c.patient || ''} (${(c.teeth || []).join(',') || c.units + ' units'})`,
quantity: c.units || 1, unitPrice: c.price || 0, total: subtotal
}],
subtotal, discountPct: 0, discount: 0, taxRate, tax, total,
paid: c.status === 'delivered' ? total : 0,
balance: c.status === 'delivered' ? 0 : total,
status: c.status === 'delivered' ? 'paid' : 'sent',
notes: c.notes || '', createdAt: nowIso(),
};
counter++;
return inv;
});
setState(s => ({ ...s, invoices: [...s.invoices, ...newInvoices], lastInvoiceNum: counter - 1 }));
};

// ─── KPI Card ───
const KpiCard = ({ label, value, sub, icon: Icon, color, isProfit }) => {
const profitColor = isProfit ? (value >= 0 ? '#34d399' : '#f87171') : color;
return (
<div className="glass rounded-xl p-4" style={{ background: `linear-gradient(135deg, ${profitColor}10, ${profitColor}05)`, border: `1px solid ${profitColor}25` }}>
<div className="flex items-start justify-between mb-2">
<div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${profitColor}20`, border: `1px solid ${profitColor}35` }}>
<Icon size={15} color={profitColor} />
</div>
</div>
<div className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-3)' }}>{label}</div>
<div className="display-font text-xl font-bold mono mt-1" style={{ color: profitColor }}>
{money(value)}
</div>
{sub && <div className="text-[10.5px] mt-1" style={{ color: 'var(--text-3)' }}>{sub}</div>}
</div>
);
};

return (
<div className="space-y-5">
{/* Header */}
<div className="flex items-center justify-between flex-wrap gap-3">
<div>
<div className="display-font text-xl md:text-2xl font-bold" style={{ color: 'var(--text)' }}>{t.accounting}</div>
<div className="text-[11.5px]" style={{ color: 'var(--text-3)' }}>{t.accountingSubtitle}</div>
</div>
<div className="flex items-center gap-2 flex-wrap">
<div className="glass rounded-lg flex p-0.5">
<button onClick={() => setTimeFilter('all')} className="px-3 py-1.5 rounded-md text-[11px] font-semibold transition" style={{ background: timeFilter === 'all' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', color: timeFilter === 'all' ? '#0891b2' : 'var(--text-2)' }}>{t.allTime}</button>
<button onClick={() => setTimeFilter('month')} className="px-3 py-1.5 rounded-md text-[11px] font-semibold transition" style={{ background: timeFilter === 'month' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', color: timeFilter === 'month' ? '#0891b2' : 'var(--text-2)' }}>{t.thisMonth}</button>
</div>
</div>
</div>

  {/* KPI Cards */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    <KpiCard label={t.totalIncome} value={metrics.totalCollected} sub={`${metrics.invoicesInPeriod.length} ${lang === 'ar' ? 'فاتورة' : 'invoices'}`} icon={TrendingUp} color="#34d399" />
    <KpiCard label={t.outstanding} value={metrics.totalOutstanding} sub={metrics.overdueAmount > 0 ? `⚠️ ${fmt2(metrics.overdueAmount)} ${t.overdueStatus}` : ''} icon={Clock} color="#f5b942" />
    <KpiCard label={t.totalExpenses} value={metrics.totalExpenses} sub={lang === 'ar' ? `متغيرة: ${fmt2(metrics.totalVarExpenses)}` : `Var: ${fmt2(metrics.totalVarExpenses)}`} icon={TrendingDown} color="#f87171" />
    <KpiCard label={t.netProfit} value={metrics.netProfit} sub={metrics.netProfit >= 0 ? (lang === 'ar' ? 'ربح' : 'Profit') : (lang === 'ar' ? 'خسارة' : 'Loss')} icon={DollarSign} color="#0891b2" isProfit />
  </div>

  {/* Tabs */}
  <div className="glass rounded-xl p-1 flex gap-1 overflow-x-auto">
    {[
      { id: 'dashboard', label: lang === 'ar' ? 'لوحة' : 'Dashboard', icon: LayoutDashboard },
      { id: 'invoices', label: t.invoices, icon: FileText },
      { id: 'payments', label: t.payments, icon: DollarSign },
      { id: 'clinics', label: t.clinics, icon: Users },
      { id: 'expenses', label: lang === 'ar' ? 'مصاريف' : 'Expenses', icon: TrendingDown },
      { id: 'reports', label: t.reports, icon: FileSpreadsheet },
      { id: 'settings', label: lang === 'ar' ? 'إعدادات' : 'Settings', icon: Settings },
    ].map(tab => {
      const Icon = tab.icon;
      const active = activeTab === tab.id;
      return (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11.5px] font-semibold transition whitespace-nowrap" style={{ background: active ? 'rgba(56, 189, 248, 0.15)' : 'transparent', color: active ? '#0891b2' : 'var(--text-2)', border: `1px solid ${active ? 'rgba(56, 189, 248, 0.3)' : 'transparent'}` }}>
          <Icon size={13} /> {tab.label}
        </button>
      );
    })}
  </div>

  {/* DASHBOARD TAB */}
  {activeTab === 'dashboard' && (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Cash Flow Chart */}
      <div className="lg:col-span-2 glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: 'rgba(120, 180, 255, 0.1)' }}>
          <TrendingUp size={14} color="#0891b2" />
          <span className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>{t.cashFlow}</span>
        </div>
        {cashFlowData.length === 0 ? (
          <div className="text-center py-8 text-[12px]" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'لا توجد بيانات' : 'No data yet'}</div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" style={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid rgba(120, 180, 255, 0.2)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2} fill="url(#colorIncome)" name={lang === 'ar' ? 'إيرادات' : 'Income'} />
              <Area type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} fill="url(#colorExp)" name={lang === 'ar' ? 'مصاريف' : 'Expenses'} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Aging Report */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: 'rgba(120, 180, 255, 0.1)' }}>
          <Clock size={14} color="#f5b942" />
          <span className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>{t.agingReport}</span>
        </div>
        {(() => {
          const aging = { '0_30': 0, '31_60': 0, '61_90': 0, '90': 0 };
          clinicBalances.forEach(c => {
            aging['0_30'] += c.agingBuckets['0_30'];
            aging['31_60'] += c.agingBuckets['31_60'];
            aging['61_90'] += c.agingBuckets['61_90'];
            aging['90'] += c.agingBuckets['90'];
          });
          const total = aging['0_30'] + aging['31_60'] + aging['61_90'] + aging['90'];
          const rows = [
            { label: t.aging0_30, value: aging['0_30'], color: '#34d399' },
            { label: t.aging31_60, value: aging['31_60'], color: '#f5b942' },
            { label: t.aging61_90, value: aging['61_90'], color: '#fb923c' },
            { label: t.aging90, value: aging['90'], color: '#f87171' },
          ];
          return (
            <div className="space-y-2">
              {rows.map(r => (
                <div key={r.label}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span style={{ color: 'var(--text-2)' }}>{r.label}</span>
                    <span className="mono font-bold" style={{ color: r.color }}>{money(r.value)}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ width: `${total > 0 ? (r.value / total) * 100 : 0}%`, height: '100%', background: r.color, transition: 'width 0.3s' }} />
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Top Clinics */}
      <div className="lg:col-span-3 glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: 'rgba(120, 180, 255, 0.1)' }}>
          <Users size={14} color="#a78bfa" />
          <span className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>{t.topClinics}</span>
        </div>
        {clinicBalances.length === 0 ? (
          <div className="text-center py-6 text-[12px]" style={{ color: 'var(--text-3)' }}>{t.noClinics}</div>
        ) : (
          <div className="space-y-2">
            {clinicBalances.slice(0, 5).map(c => (
              <div key={c.clinic} onClick={() => { setSelectedClinic(c); setActiveTab('clinics'); }} className="flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-white/5 transition">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(167, 139, 250, 0.15)', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                    <Stethoscope size={12} color="#a78bfa" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold truncate" style={{ color: 'var(--text)' }}>{c.clinic}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>{c.invoiceCount} {lang === 'ar' ? 'فاتورة' : 'invoices'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mono text-[11px]" style={{ color: 'var(--text-3)' }}>{money(c.totalBilled)} {lang === 'ar' ? 'إجمالي' : 'billed'}</div>
                  <div className="mono font-bold text-[12px]" style={{ color: c.balance > 0 ? '#f87171' : '#34d399' }}>{money(c.balance)} {c.balance > 0 ? (lang === 'ar' ? 'مستحق' : 'owed') : (lang === 'ar' ? 'مدفوع' : 'paid')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )}

  {/* INVOICES TAB */}
  {activeTab === 'invoices' && (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setEditingInvoice({ id: uid(), invoiceNumber: nextInvoiceNumber(), date: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], clinic: '', doctorName: '', items: [{ id: uid(), description: '', quantity: 1, unitPrice: 0, total: 0 }], subtotal: 0, discountPct: 0, discount: 0, taxRate: state.vatEnabled ? (state.vatDefaultRate || 0) : 0, tax: 0, total: 0, paid: 0, balance: 0, status: 'draft', notes: '' })} className="btn btn-primary">
          <Plus size={13} /> {t.newInvoice}
        </button>
        <button onClick={generateFromCases} className="btn btn-secondary">
          <RefreshCw size={13} /> {t.generateInvoices}
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
          <span className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>{t.invoicesList}</span>
          <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{state.invoices.length}</span>
        </div>
        {state.invoices.length === 0 ? (
          <div className="text-center py-8 text-[12px]" style={{ color: 'var(--text-3)' }}>{t.noInvoices}</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(120, 180, 255, 0.05)' }}>
            {[...state.invoices].reverse().map(inv => (
              <div key={inv.id} onClick={() => setEditingInvoice(inv)} className="px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="mono text-[11px] font-bold" style={{ color: '#0891b2' }}>{inv.invoiceNumber}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold" style={{ background: `${statusColor(inv.status)}20`, color: statusColor(inv.status), border: `1px solid ${statusColor(inv.status)}40` }}>
                      {statusLabel(inv.status)}
                    </span>
                  </div>
                  <div className="text-[12px] font-semibold truncate" style={{ color: 'var(--text)' }}>{inv.clinic || '—'}</div>
                  <div className="text-[10px] truncate" style={{ color: 'var(--text-3)' }}>{inv.date} → {inv.dueDate}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="mono font-bold text-[13px]" style={{ color: 'var(--text)' }}>{money(inv.total)}</div>
                  {inv.balance > 0 && <div className="mono text-[10px]" style={{ color: '#f87171' }}>{fmt2(inv.balance)} {lang === 'ar' ? 'متبقي' : 'left'}</div>}
                  {inv.balance <= 0 && <div className="text-[10px]" style={{ color: '#34d399' }}>✓ {t.paidStatus}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )}

  {/* PAYMENTS TAB */}
  {activeTab === 'payments' && (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
        <span className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>{t.payments}</span>
      </div>
      {state.payments.length === 0 ? (
        <div className="text-center py-8 text-[12px]" style={{ color: 'var(--text-3)' }}>{t.noPayments}</div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'rgba(120, 180, 255, 0.05)' }}>
          {[...state.payments].reverse().map(p => {
            const inv = state.invoices.find(i => i.id === p.invoiceId);
            return (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="mono text-[11px] font-bold" style={{ color: '#34d399' }}>{inv?.invoiceNumber || '—'}</div>
                  <div className="text-[11.5px] font-semibold" style={{ color: 'var(--text)' }}>{inv?.clinic || '—'}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>{p.date} · {t['method' + (p.method || 'Cash').charAt(0).toUpperCase() + (p.method || 'cash').slice(1)] || p.method}{p.reference ? ' · ' + p.reference : ''}</div>
                </div>
                <div className="mono font-bold" style={{ color: '#34d399' }}>+{money(p.amount)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )}

  {/* CLINICS TAB */}
  {activeTab === 'clinics' && (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
        <span className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>{t.clinicBalances}</span>
      </div>
      {clinicBalances.length === 0 ? (
        <div className="text-center py-8 text-[12px]" style={{ color: 'var(--text-3)' }}>{t.noClinics}</div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'rgba(120, 180, 255, 0.05)' }}>
          {clinicBalances.map(c => (
            <div key={c.clinic} className="px-4 py-3 hover:bg-white/5 cursor-pointer transition" onClick={() => setSelectedClinic(c)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Stethoscope size={13} color="#a78bfa" />
                  <span className="text-[12.5px] font-bold" style={{ color: 'var(--text)' }}>{c.clinic}</span>
                </div>
                <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{c.invoiceCount} {lang === 'ar' ? 'فاتورة' : 'inv'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded" style={{ background: 'rgba(56, 189, 248, 0.06)' }}>
                  <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{t.totalBilled}</div>
                  <div className="mono text-[11.5px] font-bold" style={{ color: '#0891b2' }}>{fmt2(c.totalBilled)}</div>
                </div>
                <div className="p-2 rounded" style={{ background: 'rgba(52, 211, 153, 0.06)' }}>
                  <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{t.totalPaid}</div>
                  <div className="mono text-[11.5px] font-bold" style={{ color: '#34d399' }}>{fmt2(c.totalPaid)}</div>
                </div>
                <div className="p-2 rounded" style={{ background: c.balance > 0 ? 'rgba(248, 113, 113, 0.06)' : 'rgba(52, 211, 153, 0.06)' }}>
                  <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{t.balanceOwed}</div>
                  <div className="mono text-[11.5px] font-bold" style={{ color: c.balance > 0 ? '#f87171' : '#34d399' }}>{fmt2(c.balance)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

  {/* EXPENSES TAB */}
  {activeTab === 'expenses' && (
    <div className="space-y-3">
      <button onClick={() => setShowAddExpense(true)} className="btn btn-primary w-full justify-center">
        <Plus size={14} /> {t.addExpense}
      </button>
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
          <span className="text-[11.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>{t.expensesList}</span>
          <span className="text-[11px] mono" style={{ color: '#f87171' }}>{money(metrics.totalVarExpenses)}</span>
        </div>
        {state.expenses.length === 0 ? (
          <div className="text-center py-8 text-[12px]" style={{ color: 'var(--text-3)' }}>{t.noExpenses}</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(120, 180, 255, 0.05)' }}>
            {[...state.expenses].reverse().map(exp => {
              const cat = state.expenseCategories.find(c => c.id === exp.category);
              return (
                <div key={exp.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-2 h-10 rounded shrink-0" style={{ background: cat?.color || '#94a3b8' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold truncate" style={{ color: 'var(--text)' }}>{lang === 'ar' ? (exp.name_ar || exp.name_en || '—') : (exp.name_en || exp.name_ar || '—')}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>{cat ? (lang === 'ar' ? cat.name_ar : cat.name_en) : exp.category} · {exp.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="mono font-bold text-[12px]" style={{ color: '#f87171' }}>{money(exp.amount)}</span>
                    <button onClick={() => removeItem('expenses', exp.id)} className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                      <Trash2 size={11} color="#f87171" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )}

  {/* REPORTS TAB */}
  {activeTab === 'reports' && <ReportsTab ctx={ctx} />}

  {/* SETTINGS TAB */}
  {activeTab === 'settings' && <AccountingSettingsTab ctx={ctx} />}

  {/* MODALS */}
  {editingInvoice && <InvoiceEditModal invoice={editingInvoice} ctx={ctx} onClose={() => setEditingInvoice(null)} onSave={saveInvoice} onDelete={deleteInvoice} onRecordPayment={() => setRecordingPayment(editingInvoice)} />}
  {showAddExpense && <AddExpenseModal ctx={ctx} onClose={() => setShowAddExpense(false)} onSave={(exp) => { addItem('expenses', exp); setShowAddExpense(false); }} />}
  {recordingPayment && <PaymentRecordModal invoice={recordingPayment} ctx={ctx} onClose={() => setRecordingPayment(null)} onSave={(p) => recordPaymentFor(recordingPayment, p)} />}
  {selectedClinic && <ClinicStatementModal clinic={selectedClinic} ctx={ctx} onClose={() => setSelectedClinic(null)} onOpenInvoice={(inv) => { setSelectedClinic(null); setEditingInvoice(inv); }} />}
</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  INVOICE EDIT MODAL (Smart, editable, printable)
// ═══════════════════════════════════════════════════════════════════════
function InvoiceEditModal({ invoice, ctx, onClose, onSave, onDelete, onRecordPayment }) {
const { state, t, lang, fmt2, money, askConfirm } = ctx;
const [inv, setInv] = useState(invoice);

// Auto-recalculate totals when items, discount, or tax changes
useEffect(() => {
const subtotal = inv.items.reduce((s, item) => s + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
const discount = subtotal * ((Number(inv.discountPct) || 0) / 100);
const afterDiscount = subtotal - discount;
const tax = afterDiscount * ((Number(inv.taxRate) || 0) / 100);
const total = afterDiscount + tax;
const balance = total - (Number(inv.paid) || 0);
setInv(prev => ({ ...prev, subtotal, discount, tax, total, balance }));
}, [inv.items, inv.discountPct, inv.taxRate, inv.paid]);

const updateField = (field, value) => setInv(prev => ({ ...prev, [field]: value }));

const updateItem = (id, field, value) => {
setInv(prev => ({
...prev,
items: prev.items.map(item => {
if (item.id !== id) return item;
const updated = { ...item, [field]: value };
updated.total = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
return updated;
})
}));
};

const addItemRow = () => {
setInv(prev => ({ ...prev, items: [...prev.items, { id: uid(), description: '', quantity: 1, unitPrice: 0, total: 0 }] }));
};

const removeItemRow = (id) => {
if (inv.items.length <= 1) return;
setInv(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
};

// Print invoice
const printInvoice = () => {
const w = window.open('', '_blank');
if (!w) return;
const itemRows = inv.items.map(item => `<tr> <td style="padding:10px;border-bottom:1px solid #ddd;">${item.description || '—'}</td> <td style="padding:10px;text-align:center;border-bottom:1px solid #ddd;font-family:monospace;">${item.quantity}</td> <td style="padding:10px;text-align:right;border-bottom:1px solid #ddd;font-family:monospace;">${money(item.unitPrice)}</td> <td style="padding:10px;text-align:right;border-bottom:1px solid #ddd;font-family:monospace;font-weight:700;">${money(item.total)}</td> </tr>`).join('');

w.document.write(`<!DOCTYPE html>

<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
<head>
<meta charset="UTF-8" />
<title>Invoice ${inv.invoiceNumber}</title>
<style>
* { box-sizing: border-box; }
body { font-family: ${lang === 'ar' ? '"Tajawal", system-ui, sans-serif' : '"Manrope", system-ui, sans-serif'}; margin: 0; padding: 30px; background: #fff; color: #1a1a1a; }
.invoice { max-width: 800px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #1a1a1a; margin-bottom: 24px; }
.brand h1 { margin: 0 0 4px; font-size: 24px; letter-spacing: 0.5px; }
.brand .sub { font-size: 12px; color: #666; }
.invoice-info { text-align: ${lang === 'ar' ? 'left' : 'right'}; }
.invoice-info h2 { margin: 0; font-size: 28px; font-family: monospace; letter-spacing: 2px; }
.invoice-info .num { font-size: 13px; color: #666; font-family: monospace; margin-top: 4px; }
.bill-section { display: flex; gap: 30px; margin-bottom: 30px; }
.bill-block { flex: 1; }
.bill-block .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #666; margin-bottom: 6px; font-weight: 600; }
.bill-block .val { font-size: 14px; line-height: 1.6; }
table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
table thead { background: #1a1a1a; color: #fff; }
table th { padding: 12px 10px; text-align: ${lang === 'ar' ? 'right' : 'left'}; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
table th.center { text-align: center; }
table th.right { text-align: ${lang === 'ar' ? 'left' : 'right'}; }
.totals { display: flex; justify-content: flex-end; margin-bottom: 24px; }
.totals-box { min-width: 280px; }
.totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
.totals-row.grand { border-top: 2px solid #1a1a1a; margin-top: 8px; padding-top: 12px; font-size: 16px; font-weight: 700; }
.totals-row.paid { color: #16a34a; }
.totals-row.balance { color: #dc2626; font-weight: 700; }
.status-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
.notes { margin-top: 30px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 12px; color: #555; }
.footer { margin-top: 40px; padding-top: 16px; border-top: 1px dashed #999; text-align: center; font-size: 11px; color: #888; }
@media print { body { padding: 0; } @page { size: A4; margin: 15mm; } }
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <div class="brand">
      <h1>Evora Dental Lab</h1>
      <div class="sub">${lang === 'ar' ? 'مختبر الأسنان' : 'Dental Laboratory'}</div>
    </div>
    <div class="invoice-info">
      <h2>${lang === 'ar' ? 'فاتورة' : 'INVOICE'}</h2>
      <div class="num">${inv.invoiceNumber}</div>
      <div style="margin-top:8px;">
        <span class="status-badge" style="background:${inv.status === 'paid' ? '#dcfce7' : inv.status === 'overdue' ? '#fee2e2' : '#fef3c7'};color:${inv.status === 'paid' ? '#16a34a' : inv.status === 'overdue' ? '#dc2626' : '#ca8a04'};">
          ${inv.status === 'paid' ? (lang === 'ar' ? 'مدفوعة' : 'PAID') : inv.status === 'overdue' ? (lang === 'ar' ? 'متأخرة' : 'OVERDUE') : (lang === 'ar' ? 'غير مدفوعة' : 'UNPAID')}
        </span>
      </div>
    </div>
  </div>

  <div class="bill-section">
    <div class="bill-block">
      <div class="lbl">${lang === 'ar' ? 'فاتورة إلى' : 'Bill To'}</div>
      <div class="val">
        <strong>${inv.clinic || '—'}</strong><br/>
        ${inv.doctorName ? inv.doctorName + '<br/>' : ''}
      </div>
    </div>
    <div class="bill-block">
      <div class="lbl">${lang === 'ar' ? 'التاريخ' : 'Issue Date'}</div>
      <div class="val">${inv.date}</div>
      <div class="lbl" style="margin-top:12px;">${lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</div>
      <div class="val">${inv.dueDate}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>${lang === 'ar' ? 'الوصف' : 'Description'}</th>
        <th class="center">${lang === 'ar' ? 'الكمية' : 'Qty'}</th>
        <th class="right">${lang === 'ar' ? 'سعر الوحدة' : 'Unit Price'}</th>
        <th class="right">${lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="totals">
    <div class="totals-box">
      <div class="totals-row"><span>${lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span><span style="font-family:monospace;">${money(inv.subtotal)}</span></div>
      ${inv.discount > 0 ? `<div class="totals-row"><span>${lang === 'ar' ? 'الخصم' : 'Discount'} (${inv.discountPct}%)</span><span style="font-family:monospace;">-${money(inv.discount)}</span></div>` : ''}
      ${inv.tax > 0 ? `<div class="totals-row"><span>${lang === 'ar' ? 'الضريبة' : 'Tax'} (${inv.taxRate}%)</span><span style="font-family:monospace;">${money(inv.tax)}</span></div>` : ''}
      <div class="totals-row grand"><span>${lang === 'ar' ? 'الإجمالي' : 'Total'}</span><span style="font-family:monospace;">${money(inv.total)}</span></div>
      ${inv.paid > 0 ? `<div class="totals-row paid"><span>${lang === 'ar' ? 'المدفوع' : 'Paid'}</span><span style="font-family:monospace;">${money(inv.paid)}</span></div>` : ''}
      ${inv.balance > 0 ? `<div class="totals-row balance"><span>${lang === 'ar' ? 'الرصيد المستحق' : 'Balance Due'}</span><span style="font-family:monospace;">${money(inv.balance)}</span></div>` : ''}
    </div>
  </div>

${inv.notes ? `<div class="notes"><strong>${lang === 'ar' ? 'ملاحظات' : 'Notes'}:</strong> ${inv.notes}</div>` : ''}

  ${state.vatNumber ? `<div class="notes"><strong>${lang === 'ar' ? 'الرقم الضريبي' : 'VAT/Tax No.'}:</strong> ${state.vatNumber}</div>` : ''}

  <div class="footer">${lang === 'ar' ? 'شكراً لتعاملكم معنا' : 'Thank you for your business'} · Evora Dental Lab${state.vatNumber ? ` · ${lang === 'ar' ? 'رقم ضريبي' : 'VAT'}: ${state.vatNumber}` : ''} · ${new Date().toLocaleDateString()}</div>
</div>
<script>setTimeout(() => window.print(), 500);</script>
</body>
</html>`);
    w.document.close();
  };

return (
<div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', padding: '20px' }} onClick={onClose}>
<div className="glass-strong rounded-2xl w-full max-w-4xl my-4" style={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid rgba(120, 180, 255, 0.2)' }} onClick={e => e.stopPropagation()}>
{/* Header */}
<div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(120, 180, 255, 0.15)', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(167, 139, 250, 0.08))', backdropFilter: 'blur(10px)' }}>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
<FileText size={18} color="#0891b2" />
</div>
<div>
<h2 className="text-base font-bold mono" style={{ color: 'var(--text)' }}>{inv.invoiceNumber}</h2>
<div className="text-[11px]" style={{ color: 'var(--text-3)' }}>{state.invoices.find(i => i.id === inv.id) ? t.editInvoice : t.newInvoice}</div>
</div>
</div>
<button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
<X size={14} color="#f87171" />
</button>
</div>

    {/* Body */}
    <div className="p-6 space-y-5">
      {/* Top section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-[10.5px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-3)' }}>{t.billTo}</div>
          <div className="space-y-2">
            <input type="text" value={inv.clinic} onChange={e => updateField('clinic', e.target.value)} placeholder={lang === 'ar' ? 'اسم العيادة' : 'Clinic name'} className="themed w-full" />
            <input type="text" value={inv.doctorName} onChange={e => updateField('doctorName', e.target.value)} placeholder={lang === 'ar' ? 'اسم الطبيب' : 'Doctor name'} className="themed w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-3)' }}>{t.invoiceDate}</label>
            <input type="date" value={inv.date} onChange={e => updateField('date', e.target.value)} className="themed w-full" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-3)' }}>{t.dueDate}</label>
            <input type="date" value={inv.dueDate} onChange={e => updateField('dueDate', e.target.value)} className="themed w-full" />
          </div>
        </div>
      </div>

      {/* Items table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10.5px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-3)' }}>{t.items}</div>
          <button onClick={addItemRow} className="text-[10.5px] uppercase font-bold flex items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#0891b2', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <Plus size={10} /> {t.addItem}
          </button>
        </div>
        <div className="space-y-2">
          {inv.items.map((item, idx) => (
            <div key={item.id} className="grid gap-2" style={{ gridTemplateColumns: '1fr 70px 100px 100px 32px' }}>
              <input type="text" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder={t.itemDescription} className="themed" />
              <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)} className="themed mono text-center" min="0" step="1" />
              <input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', e.target.value)} className="themed mono text-center" min="0" step="0.01" />
              <div className="mono font-bold text-right py-2 px-2 rounded text-[12px]" style={{ background: 'rgba(52, 211, 153, 0.08)', color: '#34d399' }}>{fmt2(item.total)}</div>
              <button onClick={() => removeItemRow(item.id)} className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(248, 113, 113, 0.1)' }}>
                <Trash2 size={11} color="#f87171" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Totals section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-3)' }}>{t.discountPct}</label>
            <input type="number" value={inv.discountPct} onChange={e => updateField('discountPct', Number(e.target.value) || 0)} className="themed w-full mono" min="0" max="100" step="0.5" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-3)' }}>{t.taxRate}</label>
            <input type="number" value={inv.taxRate} onChange={e => updateField('taxRate', Number(e.target.value) || 0)} className="themed w-full mono" min="0" max="100" step="0.5" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'الحالة' : 'Status'}</label>
            <select value={inv.status} onChange={e => updateField('status', e.target.value)} className="themed w-full">
              <option value="draft">{t.draftStatus}</option>
              <option value="sent">{t.sentStatus}</option>
              <option value="partial">{t.partialPaid}</option>
              <option value="paid">{t.paidStatus}</option>
              <option value="overdue">{t.overdueStatus}</option>
              <option value="cancelled">{t.cancelledStatus}</option>
            </select>
          </div>
        </div>
        <div className="p-4 rounded-lg space-y-2" style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(120, 180, 255, 0.1)' }}>
          <div className="flex justify-between text-[12px]"><span style={{ color: 'var(--text-2)' }}>{t.subtotal}</span><span className="mono">{money(inv.subtotal)}</span></div>
          {inv.discount > 0 && <div className="flex justify-between text-[12px]"><span style={{ color: 'var(--text-2)' }}>{t.discount}</span><span className="mono" style={{ color: '#f87171' }}>-{money(inv.discount)}</span></div>}
          {inv.tax > 0 && <div className="flex justify-between text-[12px]"><span style={{ color: 'var(--text-2)' }}>{t.tax}</span><span className="mono">{money(inv.tax)}</span></div>}
          <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'rgba(120, 180, 255, 0.15)' }}><span className="font-bold" style={{ color: 'var(--text)' }}>{t.grandTotal}</span><span className="mono font-bold text-[14px]" style={{ color: '#0891b2' }}>{money(inv.total)}</span></div>
          {inv.paid > 0 && <div className="flex justify-between text-[12px]"><span style={{ color: 'var(--text-2)' }}>{t.amountPaid}</span><span className="mono" style={{ color: '#34d399' }}>{money(inv.paid)}</span></div>}
          {inv.balance > 0 && <div className="flex justify-between"><span className="font-bold text-[12px]" style={{ color: 'var(--text)' }}>{t.balance}</span><span className="mono font-bold" style={{ color: '#f87171' }}>{money(inv.balance)}</span></div>}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-3)' }}>{t.notesField}</label>
        <textarea value={inv.notes} onChange={e => updateField('notes', e.target.value)} rows="2" className="themed w-full" />
      </div>
    </div>

    {/* Footer */}
    <div className="sticky bottom-0 px-6 py-4 flex items-center justify-between gap-2 border-t flex-wrap" style={{ borderColor: 'rgba(120, 180, 255, 0.15)', background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)' }}>
      <div className="flex gap-2">
        {state.invoices.find(i => i.id === inv.id) && (
          <button onClick={async () => { if (await askConfirm({ title: lang === 'ar' ? 'حذف الفاتورة' : 'Delete Invoice', message: lang === 'ar' ? 'هل تريد حذف هذه الفاتورة نهائياً؟' : 'Permanently delete this invoice?', confirmLabel: lang === 'ar' ? 'حذف' : 'Delete', danger: true })) { onDelete(inv.id); onClose(); } }} className="btn btn-ghost" style={{ color: '#f87171' }}>
            <Trash2 size={13} />
          </button>
        )}
        {inv.balance > 0 && (
          <button onClick={onRecordPayment} className="btn btn-secondary">
            <DollarSign size={13} /> {t.recordPayment}
          </button>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={printInvoice} className="btn btn-secondary">
          <Printer size={13} /> {t.printInvoice}
        </button>
        <button onClick={onClose} className="btn btn-ghost">{t.cancelCase}</button>
        <button onClick={() => onSave(inv)} className="btn btn-primary">
          <Save size={13} /> {t.saveCase}
        </button>
      </div>
    </div>
  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  PAYMENT RECORD MODAL
// ═══════════════════════════════════════════════════════════════════════
function PaymentRecordModal({ invoice, ctx, onClose, onSave }) {
const { t, lang, fmt2 } = ctx;
const [form, setForm] = useState({
date: new Date().toISOString().split('T')[0],
amount: invoice.balance,
method: 'cash',
reference: '',
notes: ''
});

const handleSubmit = () => {
if (!form.amount || form.amount <= 0) return;
onSave({ ...form, amount: Number(form.amount) });
};

return (
<div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
<div className="glass-strong rounded-2xl w-full max-w-md" style={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid rgba(120, 180, 255, 0.2)' }} onClick={e => e.stopPropagation()}>
<div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(120, 180, 255, 0.15)' }}>
<div className="flex items-center gap-2">
<DollarSign size={16} color="#34d399" />
<span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{t.recordPayment}</span>
</div>
<button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'rgba(248, 113, 113, 0.1)' }}>
<X size={12} color="#f87171" />
</button>
</div>
<div className="p-5 space-y-3">
<div className="p-3 rounded-lg" style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
<div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{invoice.invoiceNumber}</div>
<div className="text-[12.5px] font-bold" style={{ color: 'var(--text)' }}>{invoice.clinic}</div>
<div className="flex justify-between mt-1 text-[11px]">
<span style={{ color: 'var(--text-3)' }}>{t.balance}:</span>
<span className="mono font-bold" style={{ color: '#f87171' }}>{money(invoice.balance)}</span>
</div>
</div>
<div className="grid grid-cols-2 gap-3">
<div>
<label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'المبلغ' : 'Amount'} (KD)</label>
<input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="themed w-full mono" step="0.01" />
</div>
<div>
<label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-3)' }}>{t.expenseDate}</label>
<input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="themed w-full" />
</div>
</div>
<div>
<label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-3)' }}>{t.paymentMethod}</label>
<select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} className="themed w-full">
<option value="cash">{t.methodCash}</option>
<option value="card">{t.methodCard}</option>
<option value="bank">{t.methodBank}</option>
<option value="check">{t.methodCheck}</option>
<option value="other">{t.methodOther}</option>
</select>
</div>
<div>
<label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-3)' }}>{t.reference}</label>
<input type="text" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} className="themed w-full" placeholder={lang === 'ar' ? 'رقم الإيصال / الشيك' : 'Receipt / check #'} />
</div>
</div>
<div className="px-5 py-3 border-t flex justify-end gap-2" style={{ borderColor: 'rgba(120, 180, 255, 0.15)' }}>
<button onClick={onClose} className="btn btn-ghost">{t.cancelCase}</button>
<button onClick={handleSubmit} className="btn btn-primary"><Save size={13} /> {t.saveCase}</button>
</div>
</div>
</div>
);
}

// ═══════════════════════════════════════════════════════════════════════
//  CLINIC STATEMENT MODAL
// ═══════════════════════════════════════════════════════════════════════
function ClinicStatementModal({ clinic, ctx, onClose, onOpenInvoice }) {
const { state, t, lang, fmt2, money } = ctx;
const clinicInvoices = state.invoices.filter(i => i.clinic === clinic.clinic);
const clinicPayments = state.payments.filter(p => {
const inv = state.invoices.find(i => i.id === p.invoiceId);
return inv && inv.clinic === clinic.clinic;
});

return (
<div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
<div className="glass-strong rounded-2xl w-full max-w-3xl my-4" style={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid rgba(120, 180, 255, 0.2)' }} onClick={e => e.stopPropagation()}>
<div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(120, 180, 255, 0.15)', background: 'rgba(255, 255, 255, 0.98)' }}>
<div className="flex items-center gap-3">
<Stethoscope size={18} color="#a78bfa" />
<div>
<div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{clinic.clinic}</div>
<div className="text-[11px]" style={{ color: 'var(--text-3)' }}>{t.clinicStatement}</div>
</div>
</div>
<button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(248, 113, 113, 0.1)' }}>
<X size={14} color="#f87171" />
</button>
</div>

    <div className="p-5 space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(56, 189, 248, 0.08)' }}>
          <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{t.totalBilled}</div>
          <div className="mono font-bold text-[13px]" style={{ color: '#0891b2' }}>{money(clinic.totalBilled)}</div>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(52, 211, 153, 0.08)' }}>
          <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{t.totalPaid}</div>
          <div className="mono font-bold text-[13px]" style={{ color: '#34d399' }}>{money(clinic.totalPaid)}</div>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ background: clinic.balance > 0 ? 'rgba(248, 113, 113, 0.08)' : 'rgba(52, 211, 153, 0.08)' }}>
          <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{t.balanceOwed}</div>
          <div className="mono font-bold text-[13px]" style={{ color: clinic.balance > 0 ? '#f87171' : '#34d399' }}>{money(clinic.balance)}</div>
        </div>
      </div>

      {/* Invoices list */}
      <div>
        <div className="text-[10.5px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-3)' }}>{t.invoices} ({clinicInvoices.length})</div>
        <div className="space-y-1">
          {clinicInvoices.map(inv => (
            <div key={inv.id} onClick={() => onOpenInvoice(inv)} className="px-3 py-2 rounded-lg flex justify-between items-center cursor-pointer hover:bg-white/5 transition" style={{ background: 'rgba(241, 245, 249, 0.7)', border: '1px solid rgba(120, 180, 255, 0.08)' }}>
              <div>
                <div className="mono text-[11px] font-bold" style={{ color: '#0891b2' }}>{inv.invoiceNumber}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>{inv.date}</div>
              </div>
              <div className="text-right">
                <div className="mono text-[12px] font-bold" style={{ color: 'var(--text)' }}>{money(inv.total)}</div>
                {inv.balance > 0 ? <div className="text-[10px]" style={{ color: '#f87171' }}>{money(inv.balance)} {lang === 'ar' ? 'متبقي' : 'left'}</div> : <div className="text-[10px]" style={{ color: '#34d399' }}>✓ {t.paidStatus}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payments list */}
      {clinicPayments.length > 0 && (
        <div>
          <div className="text-[10.5px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-3)' }}>{t.payments} ({clinicPayments.length})</div>
          <div className="space-y-1">
            {clinicPayments.map(p => {
              const inv = state.invoices.find(i => i.id === p.invoiceId);
              return (
                <div key={p.id} className="px-3 py-2 rounded-lg flex justify-between items-center" style={{ background: 'rgba(52, 211, 153, 0.05)', border: '1px solid rgba(52, 211, 153, 0.15)' }}>
                  <div>
                    <div className="text-[11px]" style={{ color: 'var(--text)' }}>{inv?.invoiceNumber || '—'}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>{p.date}</div>
                  </div>
                  <div className="mono font-bold text-[12px]" style={{ color: '#34d399' }}>+{money(p.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  ADD EXPENSE MODAL
// ═══════════════════════════════════════════════════════════════════════
function AddExpenseModal({ ctx, onClose, onSave }) {
const { state, t, lang, money } = ctx;
const [form, setForm] = useState({
date: new Date().toISOString().split('T')[0],
category: 'materials',
name_ar: '',
name_en: '',
amount: 0,
notes: '',
});

const handleSubmit = () => {
if (!form.amount || form.amount <= 0) return;
const name = lang === 'ar' ? form.name_ar : form.name_en;
onSave({ ...form, name_ar: form.name_ar || name || '—', name_en: form.name_en || name || '—', amount: Number(form.amount) });
};

return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
<div className="glass-strong rounded-2xl w-full max-w-md" style={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid rgba(120, 180, 255, 0.2)' }} onClick={e => e.stopPropagation()}>
<div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(120, 180, 255, 0.15)' }}>
<div className="flex items-center gap-2">
<DollarSign size={16} color="#f87171" />
<span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{t.addExpense}</span>
</div>
<button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'rgba(248, 113, 113, 0.1)' }}>
<X size={12} color="#f87171" />
</button>
</div>
<div className="p-5 space-y-3">
<div>
<label className="block text-[10.5px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-3)' }}>{t.expenseName}</label>
<input type="text" value={lang === 'ar' ? form.name_ar : form.name_en} onChange={e => setForm({ ...form, [lang === 'ar' ? 'name_ar' : 'name_en']: e.target.value, [lang === 'ar' ? 'name_en' : 'name_ar']: e.target.value })} className="themed w-full" placeholder={lang === 'ar' ? 'مثال: شراء مواد' : 'e.g. Materials purchase'} />
</div>
<div className="grid grid-cols-2 gap-3">
<div>
<label className="block text-[10.5px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'المبلغ' : 'Amount'} (KD)</label>
<input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="themed w-full" step="0.01" />
</div>
<div>
<label className="block text-[10.5px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-3)' }}>{t.expenseDate}</label>
<input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="themed w-full" />
</div>
</div>
<div>
<label className="block text-[10.5px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-3)' }}>{t.category}</label>
<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="themed w-full">
{state.expenseCategories.map(c => (
<option key={c.id} value={c.id}>{lang === 'ar' ? c.name_ar : c.name_en}</option>
))}
</select>
</div>
</div>
<div className="px-5 py-3 border-t flex items-center justify-end gap-2" style={{ borderColor: 'rgba(120, 180, 255, 0.15)' }}>
<button onClick={onClose} className="btn btn-ghost">{t.cancelCase}</button>
<button onClick={handleSubmit} className="btn btn-primary"><Save size={13} />{t.saveCase}</button>
</div>
</div>
</div>
);
}

// ═══════════════════════════════════════════════════════════════════════
//  ANALYTICS VIEW
// ═══════════════════════════════════════════════════════════════════════
function AnalyticsView({ ctx }) {
const { state, t, lang, isRtl, kpis, totalFixed, totalSalaries, getName, matCostPerUnit } = ctx;

const fixedBreakdown = useMemo(() => {
const colors = ['#0891b2', '#a78bfa', '#f5b942', '#34d399', '#f472b6', '#06b6d4', '#fb923c'];
const items = [
...state.salaries.map((s, i) => ({ name: getName(s), value: s.count * s.salary, color: colors[i % colors.length] })),
...state.fixed.map((f, i) => ({ name: getName(f), value: f.amount, color: colors[(i + state.salaries.length) % colors.length] })),
].filter(x => x.value > 0);
return items.sort((a, b) => b.value - a.value);
}, [state.salaries, state.fixed, getName]);

const remakeByType = useMemo(() => {
const map = {};
state.cases.forEach(c => {
if (!map[c.type]) map[c.type] = { type: t[c.type] || c.type, total: 0, remakes: 0 };
map[c.type].total++;
if (c.remake) map[c.type].remakes++;
});
return Object.values(map);
}, [state.cases, t]);

const materialCosts = state.materials.map((m, i) => ({
name: getName(m),
cost: matCostPerUnit(m),
color: ['#0891b2', '#a78bfa', '#f5b942', '#34d399', '#f472b6'][i % 5]
})).sort((a, b) => b.cost - a.cost);

const revenueByClinic = useMemo(() => {
const map = {};
state.cases.forEach(c => {
map[c.clinic] = (map[c.clinic] || 0) + c.units * c.price;
});
return Object.entries(map).map(([clinic, rev]) => ({ clinic, revenue: rev })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
}, [state.cases]);

// NEW: Average time per room
const avgTimePerRoom = useMemo(() => {
const tally = {};
ROOMS.forEach(r => { tally[r.id] = { total: 0, count: 0 }; });
state.cases.forEach(c => {
const h = c.roomHistory || [];
for (let i = 0; i < h.length - 1; i++) {
const r = h[i].room;
const dur = (new Date(h[i + 1].at).getTime() - new Date(h[i].at).getTime()) / 3600000;
if (tally[r] && dur > 0) {
tally[r].total += dur;
tally[r].count++;
}
}
});
return ROOMS.map(r => ({
room: lang === 'ar' ? r.ar : r.en,
hours: tally[r.id].count > 0 ? Number((tally[r.id].total / tally[r.id].count).toFixed(1)) : 0,
color: r.color,
}));
}, [state.cases, lang]);

return (

<div className="space-y-5">
<div className="grid md:grid-cols-3 gap-4">
<div className="glass rounded-2xl p-5 fade-up">
<div className="text-[10.5px] uppercase font-bold tracking-widest mb-1" style={{ color: 'var(--text-3)', letterSpacing: '0.12em' }}>
{t.materialEfficiency}
</div>
<div className="display-font text-3xl font-semibold mono" style={{ color: '#0891b2' }}>
{kpis.totalRev > 0 ? fmt2((kpis.estMatCost / kpis.totalRev) * 100) : 0}%
</div>
<div className="text-[11.5px] mt-1" style={{ color: 'var(--text-3)' }}>
{lang === 'ar' ? 'تكلفة المواد كنسبة من الإيراد' : 'Material cost ratio of revenue'}
</div>
</div>
<div className="glass rounded-2xl p-5 fade-up" style={{ animationDelay: '0.05s' }}>
<div className="text-[10.5px] uppercase font-bold tracking-widest mb-1" style={{ color: 'var(--text-3)', letterSpacing: '0.12em' }}>
{t.laborCostRatio}
</div>
<div className="display-font text-3xl font-semibold mono" style={{ color: '#f5b942' }}>
{kpis.totalRev > 0 ? fmt2((totalSalaries / kpis.totalRev) * 100) : 0}%
</div>
<div className="text-[11.5px] mt-1" style={{ color: 'var(--text-3)' }}>
{lang === 'ar' ? 'الرواتب كنسبة من الإيراد' : 'Salaries as % of revenue'}
</div>
</div>
<div className="glass rounded-2xl p-5 fade-up" style={{ animationDelay: '0.1s' }}>
<div className="text-[10.5px] uppercase font-bold tracking-widest mb-1" style={{ color: 'var(--text-3)', letterSpacing: '0.12em' }}>
{t.fixedCostCoverage}
</div>
<div className="display-font text-3xl font-semibold mono" style={{ color: '#34d399' }}>
{totalFixed > 0 ? fmt2((kpis.totalRev / totalFixed) * 100) : 0}%
</div>
<div className="text-[11.5px] mt-1" style={{ color: 'var(--text-3)' }}>
{lang === 'ar' ? 'تغطية التكاليف الثابتة' : 'Revenue covers fixed costs by'}
</div>
</div>
</div>

{/* Average time per room */}

  <div className="glass rounded-2xl p-5">
    <h3 className="display-font text-lg font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text)' }}>
      <Clock size={16} color="#a78bfa" />
      {t.avgRoomTime}
    </h3>
    <p className="text-[11.5px] mb-4" style={{ color: 'var(--text-3)' }}>
      {lang === 'ar' ? 'متوسط الوقت الذي تقضيه الحالة في كل غرفة (بالساعات)' : 'Average hours a case spends in each room'}
    </p>
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={avgTimePerRoom}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,180,255,0.06)" />
          <XAxis dataKey="room" tick={{ fill: '#5d6e92', fontSize: 10 }} stroke="rgba(120,180,255,0.1)" reversed={isRtl} />
          <YAxis tick={{ fill: '#5d6e92', fontSize: 11 }} stroke="rgba(120,180,255,0.1)" orientation={isRtl ? 'right' : 'left'} />
          <Tooltip
            contentStyle={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid rgba(120, 180, 255, 0.2)', borderRadius: 10, fontSize: 12 }}
            formatter={(v) => `${v} ${t.hours}`}
          />
          <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
            {avgTimePerRoom.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>

  <div className="grid lg:grid-cols-2 gap-4">
    <div className="glass rounded-2xl p-5">
      <h3 className="display-font text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>{t.fixedExpenses}</h3>
      <p className="text-[11.5px] mb-4" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'توزيع التكاليف الثابتة' : 'Fixed cost breakdown'}</p>
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={fixedBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={1}>
              {fixedBreakdown.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="rgba(241, 245, 249, 0.85)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid rgba(120, 180, 255, 0.2)', borderRadius: 10, fontSize: 12 }}
              formatter={(v) => `${fmt(v)} KD`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

<div className="glass rounded-2xl p-5">
  <h3 className="display-font text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>{t.materialCost}</h3>
  <p className="text-[11.5px] mb-4" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'تكلفة لكل وحدة حسب المادة' : 'Cost per unit by material'}</p>
  <div className="space-y-3">
    {materialCosts.length === 0 ? (
      <div className="text-center py-6 text-sm" style={{ color: 'var(--text-3)' }}>—</div>
    ) : materialCosts.map((m, i) => {
      const max = Math.max(...materialCosts.map(x => x.cost));
      const pct = max > 0 ? (m.cost / max) * 100 : 0;
      return (
        <div key={i}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12.5px] font-semibold truncate flex-1" style={{ color: 'var(--text)' }}>{m.name}</span>
            <span className="mono text-[13px] font-bold" style={{ color: m.color }}>{fmt3(m.cost)} KD</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(120, 180, 255, 0.08)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: m.color }} />
          </div>
        </div>
      );
    })}
  </div>
</div>

  </div>

  <div className="grid lg:grid-cols-2 gap-4">
    <div className="glass rounded-2xl p-5">
      <h3 className="display-font text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>{t.remakeAnalysis}</h3>
      <p className="text-[11.5px] mb-4" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'حسب نوع الحالة' : 'By case type'}</p>
      {remakeByType.length > 0 ? (
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={remakeByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,180,255,0.06)" />
              <XAxis dataKey="type" tick={{ fill: '#5d6e92', fontSize: 11 }} stroke="rgba(120,180,255,0.1)" reversed={isRtl} />
              <YAxis tick={{ fill: '#5d6e92', fontSize: 11 }} stroke="rgba(120,180,255,0.1)" orientation={isRtl ? 'right' : 'left'} />
              <Tooltip
                contentStyle={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid rgba(120, 180, 255, 0.2)', borderRadius: 10, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="total" fill="#0891b2" fillOpacity={0.4} radius={[4, 4, 0, 0]} name={lang === 'ar' ? 'إجمالي' : 'Total'} />
              <Bar dataKey="remakes" fill="#f87171" radius={[4, 4, 0, 0]} name={t.remake} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>—</div>
      )}
    </div>

<div className="glass rounded-2xl p-5">
  <h3 className="display-font text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>
    {lang === 'ar' ? 'أفضل العيادات' : 'Top Clinics'}
  </h3>
  <p className="text-[11.5px] mb-4" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'حسب الإيرادات' : 'By revenue'}</p>
  <div className="space-y-2.5">
    {revenueByClinic.length === 0 ? (
      <div className="text-center py-6 text-sm" style={{ color: 'var(--text-3)' }}>—</div>
    ) : revenueByClinic.map((c, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(120, 180, 255, 0.03)', border: '1px solid rgba(120, 180, 255, 0.06)' }}>
        <div className="display-font text-2xl font-semibold mono shrink-0 w-10 text-center" style={{ color: i === 0 ? '#f5b942' : i === 1 ? '#a78bfa' : 'var(--text-3)' }}>
          {i + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>{c.clinic}</div>
        </div>
        <div className="mono text-base font-bold" style={{ color: '#34d399' }}>
          {fmt(c.revenue)} KD
        </div>
      </div>
    ))}
  </div>
</div>

  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  AI ASSISTANT (uses Claude API)
// ═══════════════════════════════════════════════════════════════════════
function AIAssistant({ ctx }) {
const { state, t, lang, kpis, totalFixed, totalSalaries, getName, matCostPerUnit, isRtl } = ctx;
const [messages, setMessages] = useState([
{ role: 'assistant', content: t.welcomeAi }
]);
const [input, setInput] = useState('');
const [thinking, setThinking] = useState(false);
const messagesEndRef = useRef(null);

useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, thinking]);

// ═════════════════════════════════════════════════════════════════
// LOCAL QUERY ENGINE - Searches lab data without external API
// ═════════════════════════════════════════════════════════════════
const STOPWORDS = new Set(['في','عن','من','الى','على','مع','هل','شو','ما','ال','about','the','a','an','of','in','to','for','is','are','what','how','show','give','me','my']);

const formatCaseInfo = (c) => {
const lines = [];
lines.push(`📋 ${c.caseId}`);
lines.push(`👤 ${lang === 'ar' ? 'المريض' : 'Patient'}: ${c.patient || '—'}`);
if (c.doctorName) lines.push(`👨‍⚕️ ${lang === 'ar' ? 'الطبيب' : 'Doctor'}: ${c.doctorName}`);
if (c.clinic) lines.push(`🏥 ${lang === 'ar' ? 'العيادة' : 'Clinic'}: ${c.clinic}`);
lines.push(`🦷 ${lang === 'ar' ? 'النوع' : 'Type'}: ${c.type}${c.typeOfWork ? ' / ' + c.typeOfWork : ''}`);
if (c.shade) lines.push(`🎨 ${lang === 'ar' ? 'الشيد' : 'Shade'}: ${c.shade}`);
if (c.teeth && c.teeth.length) lines.push(`🔢 ${lang === 'ar' ? 'الأسنان' : 'Teeth'}: ${c.teeth.join(', ')}`);
lines.push(`📊 ${lang === 'ar' ? 'الحالة' : 'Status'}: ${t[c.status] || c.status}`);
if (c.currentRoom) lines.push(`📍 ${lang === 'ar' ? 'الغرفة' : 'Room'}: ${c.currentRoom}`);
if (c.technician) lines.push(`👷 ${lang === 'ar' ? 'الفني' : 'Tech'}: ${c.technician}`);
lines.push(`💰 ${lang === 'ar' ? 'السعر' : 'Price'}: ${c.price} KD × ${c.units} = ${(c.price * c.units).toFixed(2)} KD`);
if (c.deadline) {
const days = daysUntil(c.deadline);
const status = days < 0 ? (lang === 'ar' ? '⚠️ متأخر' : '⚠️ Overdue') : days === 0 ? (lang === 'ar' ? '🔴 اليوم' : '🔴 Today') : days <= 3 ? `🟡 ${days}d` : `🟢 ${days}d`;
lines.push(`📅 ${lang === 'ar' ? 'الموعد' : 'Deadline'}: ${c.deadline} (${status})`);
}
return lines.join('\n');
};

const searchCases = (query) => {
const q = query.toLowerCase();
const tokens = q.split(/[\s,،.؟?!]+/).filter(t => t.length > 1 && !STOPWORDS.has(t));

if (tokens.length === 0) return null;

const scored = state.cases.map(c => {
let score = 0;
const fields = {
caseId: (c.caseId || '').toLowerCase(),
patient: (c.patient || '').toLowerCase(),
clinic: (c.clinic || '').toLowerCase(),
doctor: (c.doctorName || '').toLowerCase(),
type: (c.type || '').toLowerCase(),
typeOfWork: (c.typeOfWork || '').toLowerCase(),
shade: (c.shade || '').toLowerCase(),
status: (c.status || '').toLowerCase(),
tech: (c.technician || '').toLowerCase(),
notes: (c.notes || '').toLowerCase(),
teeth: (c.teeth || []).map(String).join(' '),
};

tokens.forEach(token => {
  // Exact caseId match - huge bonus
  if (fields.caseId === token || fields.caseId.includes(token)) score += 20;
  // Patient name match - high score
  if (fields.patient.includes(token)) score += 10;
  // Doctor/clinic match
  if (fields.doctor.includes(token)) score += 8;
  if (fields.clinic.includes(token)) score += 8;
  // Type/material match
  if (fields.type.includes(token) || fields.typeOfWork.includes(token)) score += 5;
  // Status match
  if (fields.status.includes(token)) score += 4;
  // Other fields
  if (fields.shade === token) score += 3;
  if (fields.tech.includes(token)) score += 3;
  if (fields.notes.includes(token)) score += 2;
  // Teeth number
  if (fields.teeth.split(' ').includes(token)) score += 6;
});

return { case: c, score };

});

return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
};

const localQuery = (query) => {
const q = query.toLowerCase().trim();

if (!q) return lang === 'ar' ? 'اكتب سؤالك…' : 'Type your question…';

// Greeting
if (q.match(/^(hi|hello|hey|مرحبا|السلام|اهلا|أهلا|hala)/i)) {
return lang === 'ar'
? `مرحباً! 👋 أنا مساعدك المحلي. أقدر أساعدك بـ:\n\n🔍 ابحث عن حالة (بالاسم، الرقم، أو وصف)\n📊 إحصائيات (كم حالة، إيرادات، إلخ)\n⚠️ حالات متأخرة\n📋 حالات اليوم\n👷 معلومات الفنيين\n📦 المخزون`
: `Hi! 👋 I'm your local assistant. I can help with:\n\n🔍 Search cases (by name, ID, or description)\n📊 Statistics (case counts, revenue, etc.)\n⚠️ Overdue cases\n📋 Today's cases\n👷 Technician info\n📦 Inventory`;
}

// Count queries
if (q.match(/^(كم|how many|count|عدد)/i)) {
const total = state.cases.length;
const active = state.cases.filter(c => c.status !== 'delivered').length;
const delivered = state.cases.filter(c => c.status === 'delivered').length;
const remakes = state.cases.filter(c => c.remake).length;

// Specific type count
const types = ['zirconia', 'emax', 'pmma', 'acrylic', 'implant'];
for (const type of types) {
  if (q.includes(type)) {
    const count = state.cases.filter(c => c.type === type).length;
    return lang === 'ar' ? `📊 عدد حالات ${type}: ${count}` : `📊 ${type} cases: ${count}`;
  }
}

if (q.match(/اليوم|today/i)) {
  const today = new Date().toISOString().split('T')[0];
  const todayCases = state.cases.filter(c => c.date === today);
  return lang === 'ar' ? `📋 حالات اليوم: ${todayCases.length}` : `📋 Today's cases: ${todayCases.length}`;
}

return lang === 'ar' 
  ? `📊 إحصائيات الحالات:\n• الإجمالي: ${total}\n• نشطة: ${active}\n• مسلمة: ${delivered}\n• إعادات: ${remakes}`
  : `📊 Case statistics:\n• Total: ${total}\n• Active: ${active}\n• Delivered: ${delivered}\n• Remakes: ${remakes}`;

}

// Overdue cases
if (q.match(/متأخر|overdue|late/i)) {
const overdue = state.cases.filter(c => {
const days = daysUntil(c.deadline);
return days !== null && days < 0 && c.status !== 'delivered';
});
if (overdue.length === 0) {
return lang === 'ar' ? '✅ لا توجد حالات متأخرة!' : '✅ No overdue cases!';
}
return (lang === 'ar' ? `⚠️ ${overdue.length} حالات متأخرة:\n\n` : `⚠️ ${overdue.length} overdue cases:\n\n`) +
overdue.map(c => `• ${c.caseId} - ${c.patient} (${Math.abs(daysUntil(c.deadline))}d ${lang === 'ar' ? 'متأخر' : 'late'})`).join('\n');
}

// Today's cases
if (q.match(/اليوم|today/i)) {
const today = new Date().toISOString().split('T')[0];
const todayCases = state.cases.filter(c => c.date === today || c.deadline === today);
if (todayCases.length === 0) {
return lang === 'ar' ? '📅 لا توجد حالات لليوم' : '📅 No cases for today';
}
return (lang === 'ar' ? `📋 حالات اليوم (${todayCases.length}):\n\n` : `📋 Today (${todayCases.length}):\n\n`) +
todayCases.map(c => `• ${c.caseId} - ${c.patient}`).join('\n');
}

// Stats / Revenue
if (q.match(/إيراد|ربح|revenue|profit|إحصا|stats|statistic/i)) {
return lang === 'ar'
? `📊 إحصائيات المختبر:\n\n💰 الإيرادات: ${fmt(kpis.totalRev)} KD\n📈 هامش الربح: ${fmt2(kpis.margin)}%\n🔄 معدل الإعادة: ${fmt2(kpis.remakeRate)}%\n📋 حالات نشطة: ${kpis.active}\n💸 تكاليف ثابتة: ${fmt(totalFixed)} KD/شهر`
: `📊 Lab Statistics:\n\n💰 Revenue: ${fmt(kpis.totalRev)} KD\n📈 Profit margin: ${fmt2(kpis.margin)}%\n🔄 Remake rate: ${fmt2(kpis.remakeRate)}%\n📋 Active cases: ${kpis.active}\n💸 Fixed costs: ${fmt(totalFixed)} KD/mo`;
}

// Technicians
if (q.match(/فني|تقني|technician|tech\b/i)) {
if (state.technicians.length === 0) {
return lang === 'ar' ? '👥 لا يوجد فنيين مسجلين' : '👥 No technicians registered';
}
return (lang === 'ar' ? `👥 الفنيون (${state.technicians.length}):\n\n` : `👥 Technicians (${state.technicians.length}):\n\n`) +
state.technicians.map(tch => `• ${getName(tch)} - ${tch.role} (${tch.efficiency}% eff, ${tch.monthlyOutput}/mo)`).join('\n');
}

// Inventory / Low stock
if (q.match(/مخزون|inventory|stock|نفذ|نفاد/i)) {
const low = state.inventory.filter(i => i.stock <= i.reorderAt);
if (low.length === 0) {
return lang === 'ar' ? '📦 المخزون جيد، لا يوجد نقص' : '📦 Stock is healthy, nothing low';
}
return (lang === 'ar' ? `⚠️ مخزون منخفض (${low.length}):\n\n` : `⚠️ Low stock (${low.length}):\n\n`) +
low.map(i => `• ${getName(i)}: ${i.stock}/${i.reorderAt}`).join('\n');
}

// Help
if (q.match(/help|مساعد|ساعدني|شو تعرف|what can/i)) {
return lang === 'ar'
? `أقدر أجاوبك على:\n\n🔍 ابحث عن حالة: "حالة المريض احمد"\n📊 إحصائيات: "إيرادات", "كم حالة"\n⚠️ "حالات متأخرة" أو "حالات اليوم"\n🦷 "كم حالة زيركون"\n👷 "الفنيين"\n📦 "المخزون"\n\nأو وصفلي حالة وأنا بدورها لك!`
: `I can help with:\n\n🔍 Find case: "case for patient John"\n📊 Stats: "revenue", "how many cases"\n⚠️ "overdue" or "today's cases"\n🦷 "how many zirconia cases"\n👷 "technicians"\n📦 "inventory"\n\nOr describe a case and I'll find it!`;
}

// Default: search cases by content
const results = searchCases(q);

if (!results || results.length === 0) {
return lang === 'ar'
? `🔍 لم أجد حالات لـ "${query}".\n\nجرب:\n• اسم المريض\n• رقم الحالة\n• اسم العيادة أو الطبيب\n• نوع المادة (zirconia, emax)\n• رقم السن`
: `🔍 No matches for "${query}".\n\nTry:\n• Patient name\n• Case ID\n• Clinic or doctor name\n• Material type (zirconia, emax)\n• Tooth number`;
}

if (results.length === 1) {
return (lang === 'ar' ? `✅ وجدت حالة واحدة:\n\n` : `✅ Found 1 case:\n\n`) + formatCaseInfo(results[0].case);
}

return (lang === 'ar' ? `🔍 وجدت ${results.length} حالات:\n\n` : `🔍 Found ${results.length} cases:\n\n`) +
results.map((r, i) => `━━━ ${i+1} ━━━\n${formatCaseInfo(r.case)}`).join('\n\n');
};

// Compact snapshot of the lab, sent to the AI so it can answer with live data.
const buildLabContext = () => {
const low = state.inventory.filter(i => i.stock <= i.reorderAt).map(i => getName(i));
const overdue = state.cases.filter(c => { const d = daysUntil(c.deadline); return d !== null && d < 0 && c.status !== 'delivered'; });
const lines = [];
lines.push(`Cases: total ${state.cases.length}, active ${kpis.active}, overdue ${overdue.length}, remakes ${kpis.remakes}.`);
lines.push(`Revenue ${fmt(kpis.totalRev)} KD, profit margin ${fmt2(kpis.margin)}%, fixed costs ${fmt(totalFixed)} KD/mo.`);
lines.push(`Technicians: ${state.technicians.map(tc => `${getName(tc)} (${tc.role})`).join(', ')}.`);
lines.push(`Low stock: ${low.length ? low.join(', ') : 'none'}.`);
lines.push('Cases list:');
state.cases.slice(0, 40).forEach(c => {
lines.push(`- ${c.caseId} | ${c.patient || '—'} | ${c.type} | ${c.units}u | status ${c.status} | room ${c.currentRoom} | deadline ${c.deadline}${c.technician ? ' | tech ' + c.technician : ''}`);
});
return lines.join('\n');
};

const send = async (msg) => {
const userMsg = msg || input.trim();
if (!userMsg || thinking) return;
setInput('');
const newMessages = [...messages, { role: 'user', content: userMsg }];
setMessages(newMessages);
setThinking(true);

// Try the real Claude API (Netlify function); fall back to the local engine
// when offline, not configured, or on any error — so the assistant always works.
let answer = null;
try {
const res = await fetch('/.netlify/functions/claude', {
method: 'POST',
headers: { 'content-type': 'application/json' },
body: JSON.stringify({
labContext: buildLabContext(),
messages: newMessages.filter(m => m.role === 'user' || m.role === 'assistant'),
}),
});
if (res.ok) {
const data = await res.json();
if (data && data.reply && !data.fallback) answer = data.reply;
}
} catch {
// network error — fall through to local engine
}
if (answer == null) answer = localQuery(userMsg);
setMessages([...newMessages, { role: 'assistant', content: answer }]);
setThinking(false);
};

const suggestions = [t.suggest1, t.suggest2, t.suggest3, t.suggest4];

return (

<div className="glass rounded-2xl flex flex-col" style={{ height: 'calc(100vh - 180px)', minHeight: 500 }}>
<div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
<div className="w-10 h-10 rounded-xl flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}>
<Sparkles size={17} color="#ffffff" />
<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 pulse-soft" style={{ border: '2px solid #ffffff' }} />
</div>
<div className="flex-1">
<div className="display-font text-base font-semibold" style={{ color: 'var(--text)' }}>{t.aiAssistant}</div>
<div className="text-[11px]" style={{ color: 'var(--text-3)' }}>
{lang === 'ar' ? 'مدعوم بـ Claude · بحث محلي عند عدم الاتصال' : 'Powered by Claude · offline local search fallback'}
</div>
</div>
</div>

  <div className="flex-1 scroll-y p-5 space-y-3">
    {messages.map((m, i) => (
      <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : ''}`}>
        {m.role === 'assistant' && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}>
            <Bot size={13} color="#ffffff" />
          </div>
        )}
        <div
          className="rounded-2xl px-3.5 py-2.5 max-w-[80%]"
          style={{
            background: m.role === 'user' ? 'linear-gradient(135deg, #06b6d4, #2563eb)' : 'rgba(120, 180, 255, 0.06)',
            color: m.role === 'user' ? '#ffffff' : 'var(--text)',
            fontSize: 13.5,
            lineHeight: 1.55,
            whiteSpace: 'pre-wrap',
          }}
        >
          {m.content}
        </div>
      </div>
    ))}
    {thinking && (
      <div className="flex gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}>
          <Loader2 size={13} color="#ffffff" className="animate-spin" />
        </div>
        <div className="rounded-2xl px-3.5 py-2.5" style={{ background: 'rgba(120, 180, 255, 0.06)', color: 'var(--text-3)', fontSize: 13.5 }}>
          {t.thinking}
        </div>
      </div>
    )}
    <div ref={messagesEndRef} />
  </div>

{messages.length <= 1 && (
<div className="px-5 pb-3 flex flex-wrap gap-2">
{suggestions.map((s, i) => (
<button
key={i}
onClick={() => send(s)}
className="text-[12px] px-3 py-1.5 rounded-full transition-all"
style={{
background: 'rgba(120, 180, 255, 0.04)',
border: '1px solid rgba(120, 180, 255, 0.08)',
color: 'var(--text-2)',
}}
>
{s}
</button>
))}
</div>
)}

  <div className="p-4 border-t" style={{ borderColor: 'rgba(120, 180, 255, 0.08)' }}>
    <div className="flex gap-2 items-end">
      <textarea
        className="themed flex-1 resize-none"
        style={{ padding: '10px 14px', fontSize: 13.5, minHeight: 44, maxHeight: 120 }}
        placeholder={t.chatPlaceholder}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        rows={1}
        disabled={thinking}
      />
      <button
        onClick={() => send()}
        disabled={!input.trim() || thinking}
        className="btn btn-primary"
        style={{ minHeight: 44, opacity: !input.trim() || thinking ? 0.5 : 1 }}
      >
        <Send size={15} />
      </button>
    </div>
  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════════════
//  SETTINGS VIEW
// ═══════════════════════════════════════════════════════════════════════
function SettingsView({ ctx, setLang, handleReset }) {
const { t, lang, state, setState, showToast, askConfirm } = ctx;
const importInputRef = useRef(null);

// Restore a previously exported JSON backup. Validates shape before applying.
const importJson = (e) => {
const file = e.target.files?.[0];
if (!file) return;
const reader = new FileReader();
reader.onload = async (ev) => {
try {
const parsed = JSON.parse(ev.target.result);
if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.cases)) {
throw new Error('invalid');
}
const ok = await askConfirm({
title: lang === 'ar' ? 'استيراد نسخة احتياطية' : 'Import Backup',
message: lang === 'ar' ? 'استبدال كل البيانات الحالية بالنسخة المستوردة؟' : 'Replace all current data with the imported backup?',
confirmLabel: lang === 'ar' ? 'استبدال' : 'Replace',
danger: true,
});
if (ok) {
// Merge over defaults so any newly-added fields keep valid values.
setState({ ...defaultState(), ...parsed });
showToast?.('success', lang === 'ar' ? 'تم استيراد البيانات' : 'Data imported');
}
} catch {
showToast?.('error', lang === 'ar' ? 'ملف غير صالح' : 'Invalid file');
}
};
reader.readAsText(file);
e.target.value = ''; // allow re-importing the same file
};

const exportJson = () => {
const data = JSON.stringify(state, null, 2);
const blob = new Blob([data], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `evora-dental-export-${new Date().toISOString().split('T')[0]}.json`;
a.click();
URL.revokeObjectURL(url);
};

const exportCsv = () => {
// Escape a value for CSV: wrap in quotes and double internal quotes if it
// contains a comma, quote, or newline. Prevents column-breaking & garbling.
const esc = (v) => {
const s = v === null || v === undefined ? '' : String(v);
return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const cols = ['caseId', 'patient', 'clinic', 'type', 'units', 'price', 'status', 'technician', 'date', 'remake', 'currentRoom', 'deadline'];
const lines = ['Case ID,Patient,Clinic,Type,Units,Price,Status,Technician,Date,Remake,Room,Deadline'];
state.cases.forEach(c => {
lines.push(cols.map(k => esc(c[k])).join(','));
});
// Prepend UTF-8 BOM so Excel renders Arabic text correctly.
const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `evora-cases-${new Date().toISOString().split('T')[0]}.csv`;
a.click();
URL.revokeObjectURL(url);
};

return (

<div className="max-w-3xl space-y-5">
<div className="glass rounded-2xl p-6">
<h2 className="display-font text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>
{lang === 'ar' ? 'الإعدادات العامة' : 'General Settings'}
</h2>
<p className="text-[12.5px] mb-6" style={{ color: 'var(--text-3)' }}>
{lang === 'ar' ? 'تخصيص النظام حسب احتياجاتك' : 'Customize the system to your needs'}
</p>

<div className="space-y-5">
  <SettingRow
    label={t.language}
    description={lang === 'ar' ? 'اختر لغة الواجهة' : 'Choose interface language'}
    icon={Languages}
  >
    <div className="flex gap-2">
      {[{ k: 'en', label: 'English' }, { k: 'ar', label: 'العربية' }].map(l => (
        <button
          key={l.k} onClick={() => setLang(l.k)}
          className={`btn ${lang === l.k ? 'btn-primary' : 'btn-ghost'}`}
          style={{ minWidth: 100 }}
        >
          {l.label}
        </button>
      ))}
    </div>
  </SettingRow>

  <SettingRow
    label={lang === 'ar' ? 'تصدير البيانات' : 'Export Data'}
    description={lang === 'ar' ? 'احفظ نسخة من بياناتك' : 'Save a backup of your data'}
    icon={Download}
  >
    <div className="flex gap-2">
      <button onClick={exportJson} className="btn btn-ghost">
        <FileText size={13} />
        JSON
      </button>
      <button onClick={exportCsv} className="btn btn-ghost">
        <FileSpreadsheet size={13} />
        CSV
      </button>
      <button onClick={() => window.print()} className="btn btn-ghost">
        <Printer size={13} />
        PDF
      </button>
      <button onClick={() => importInputRef.current?.click()} className="btn btn-ghost">
        <ArrowDownRight size={13} />
        {lang === 'ar' ? 'استيراد' : 'Import'}
      </button>
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        onChange={importJson}
        style={{ display: 'none' }}
      />
    </div>
  </SettingRow>

  <SettingRow
    label={lang === 'ar' ? 'إعادة تعيين' : 'Reset Data'}
    description={lang === 'ar' ? 'العودة إلى الإعدادات الافتراضية' : 'Restore default settings'}
    icon={RefreshCw}
  >
    <button onClick={handleReset} className="btn btn-danger">
      <RefreshCw size={13} />
      {lang === 'ar' ? 'إعادة تعيين' : 'Reset'}
    </button>
  </SettingRow>
</div>

  </div>

  <div className="glass rounded-2xl p-6">
    <h3 className="display-font text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>
      {lang === 'ar' ? 'حول النظام' : 'About'}
    </h3>
    <p className="text-[12.5px] mb-4" style={{ color: 'var(--text-3)' }}>
      {lang === 'ar' ? 'معلومات النظام' : 'System information'}
    </p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
      <div className="p-3 rounded-lg" style={{ background: 'rgba(120, 180, 255, 0.04)' }}>
        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'النظام' : 'System'}</div>
        <div className="font-bold" style={{ color: 'var(--text)' }}>Evora v6.0</div>
      </div>
      <div className="p-3 rounded-lg" style={{ background: 'rgba(120, 180, 255, 0.04)' }}>
        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'المواد' : 'Materials'}</div>
        <div className="mono font-bold" style={{ color: 'var(--text)' }}>{state.materials.length}</div>
      </div>
      <div className="p-3 rounded-lg" style={{ background: 'rgba(120, 180, 255, 0.04)' }}>
        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'الحالات' : 'Cases'}</div>
        <div className="mono font-bold" style={{ color: 'var(--text)' }}>{state.cases.length}</div>
      </div>
      <div className="p-3 rounded-lg" style={{ background: 'rgba(120, 180, 255, 0.04)' }}>
        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>{lang === 'ar' ? 'الفنيون' : 'Techs'}</div>
        <div className="mono font-bold" style={{ color: 'var(--text)' }}>{state.technicians.length}</div>
      </div>
    </div>
  </div>
</div>

);
}

function SettingRow({ label, description, icon: Icon, children }) {
return (

<div className="flex items-start justify-between gap-4 pb-5 border-b last:border-b-0 last:pb-0" style={{ borderColor: 'rgba(120, 180, 255, 0.06)' }}>
<div className="flex items-start gap-3 flex-1">
<div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
<Icon size={15} color="#0891b2" />
</div>
<div className="flex-1 min-w-0">
<div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{label}</div>
<div className="text-[11.5px] mt-0.5" style={{ color: 'var(--text-3)' }}>{description}</div>
</div>
</div>
<div className="shrink-0">
{children}
</div>
</div>
);
}