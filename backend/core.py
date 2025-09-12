import spacy
import os, tempfile
from dotenv import load_dotenv 
import google.generativeai as genai
import re
import fitz
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import HorizontalBarChart
from datetime import datetime

load_dotenv()

# Loading NLP English Model
nlp = spacy.load("en_core_web_md")

# Loading Gemini LLM
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")
genai.configure(api_key=gemini_api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

# Temp DB
job_descriptions_db = {
    "Software Developer": """
        We are looking for a Software Developer skilled in Python, Django, REST API, Docker, and Kubernetes.
        Experience in cloud infrastructure, CI/CD pipelines, and relational databases like PostgreSQL is a plus.
    """,
    "Data Scientist": """
        Seeking Data Scientist with strong skills in Python, Machine Learning, Pandas, NumPy, and data visualization.
        Knowledge of TensorFlow, PyTorch, and cloud services like AWS is desirable.
    """,
    "DevOps Engineer": """
        DevOps Engineer needed with expertise in Docker, Kubernetes, Jenkins, Terraform, CI/CD automation, and cloud infrastructure.
        Experience in monitoring tools and scripting (Python/Bash) is essential.
    """,
}

TECH_SKILLS = {
    "python","django","flask","fastapi","numpy","pandas","scipy",
    "matplotlib","seaborn","tensorflow","pytorch","docker","kubernetes",
    "aws","azure","gcp","postgresql","mysql","mongodb","sql",
    "linux","git","javascript","react","java","c++","c#","php"
}

# Function to get the Job Description from DB
def get_description_from_db(job_role: str) -> str:
    return job_descriptions_db.get(job_role, "No description available for this role.")

# Function to parse resume
def parse_resume(file) -> dict:
    """
    Accepts an UploadFile-like object (has .file) or a simple file path (for local tests).
    Returns {"text": full_text, "skills": [...]} with skills lowercased from TECH_SKILLS.
    """
    # read bytes (supports FastAPI UploadFile or a path string)
    raw_bytes = None
    if hasattr(file, "file"):
        # Uploaded file from FastAPI
        raw_bytes = file.file.read()
    elif isinstance(file, (bytes, bytearray)):
        raw_bytes = file
    else:
        # assume file is a path
        with open(file, "rb") as fh:
            raw_bytes = fh.read()

    text = ""
    try:
        with fitz.open(stream=raw_bytes, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text("text") + "\n"
    except Exception:
        # fallback: try decode bytes
        try:
            text = raw_bytes.decode(errors="ignore")
        except Exception:
            text = ""

    # normalize whitespace
    text_norm = re.sub(r"\s+", " ", text)

    found = set()
    for skill in TECH_SKILLS:
        # word boundary match, case-insensitive
        if re.search(r"\b" + re.escape(skill) + r"\b", text_norm, flags=re.IGNORECASE):
            found.add(skill)  # store lowercase canonical

    return {
        "text": text,
        "skills": sorted(list(found))
    }

# Function to apply NLP on Job Description 
def extract_job_skills(job_description: str) -> list:
    doc = nlp(job_description)
    skills = set()
    COMMON_STOPWORDS = {"software", "developer", "experience", "databases", "pipelines", "knowledge", "service", "engineer"}
    TECH_SKILLS_DICT = {
    "python", "django", "flask", "fastapi", "numpy", "pandas", "scipy",
    "matplotlib", "seaborn", "tensorflow", "keras", "pytorch",
    "jenkins", "docker", "kubernetes", "ansible", "terraform",
    "aws", "azure", "google cloud", "gcp", "oracle cloud",
    "postgresql", "mysql", "mongodb", "sqlite", "redis",
    "graphql", "rest api", "soap api",
    "git", "github", "gitlab", "bitbucket",
    "celery", "rabbitmq",
    "elasticsearch", "logstash", "kibana",
    "apache", "nginx",
    "linux", "ubuntu", "centos",
    "microservices", "ci/cd", "tdd", "bdd",
    "oauth", "jwt", "ssl",
    "object-oriented programming", "oop",
    "multithreading", "asyncio",
    "react", "angular", "vue.js",
    "typescript", "javascript", "java", "c++", "c#", "php", "ruby", "go"
        }

    for token in doc:
        token_lower = token.text.lower()
        if token_lower in TECH_SKILLS_DICT:
            skills.add(token.text)

    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT", "WORK_OF_ART", "TECHNOLOGY"]:  
            skills.add(ent.text)

    # Fallback: Extract all proper nouns (PROPN) and nouns (NOUN)
    if not skills:
        skills = [token.text for token in doc if token.pos_ in ("PROPN", "NOUN")]
        skills.update(skills)

    skills = [skill for skill in skills if skill.lower() not in COMMON_STOPWORDS]
    return list(set(skills))

# Function to calculate time saved estimate
def calculate_estimated_time_saved(match_info: dict) -> int:
    estimated_time_per_skill_min = 5  
    missing_skills_count = len(match_info.get("missing_skills", []))
    return missing_skills_count * estimated_time_per_skill_min

# Function to normalize skills
def _normalize_skill(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^\w+#.+-]", "", s)
    return s

# Function to analyze skill match
def analyze_skill_match(resume_data: dict, job_skills: list) -> dict:
    resume_skills = resume_data.get("skills") or []
    job_skills = job_skills or []

    resume_map = { _normalize_skill(s): s for s in resume_skills }
    job_map = { _normalize_skill(s): s for s in job_skills }

    matched_norm = set(resume_map.keys()) & set(job_map.keys())
    matched = [resume_map[n] for n in matched_norm]

    missing_norm = set(job_map.keys()) - matched_norm
    missing = [job_map[n] for n in missing_norm]

    match_percentage = 0.0
    if len(job_map) > 0:
        match_percentage = round(len(matched) / len(job_map) * 100, 2)

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_percentage
    }

# Function to get personalised recommendations from LLM
def generate_llm_recommendations(resume_data: dict, job_description: str, match_info: dict) -> str:
    prompt = f"""
    The user wants to apply for the following role:
    {job_description}
    
    Current resume skills:
    {', '.join(resume_data['skills'])}
    
    Matched skills:
    {', '.join(match_info['matched_skills'])}
    
    Missing skills:
    {', '.join(match_info['missing_skills'])}
    
    Provide 3 actionable, realistic, and market-trending recommendations to help the user improve their resume and skillset.
    Focus on bridging missing skills with real courses, certifications, or projects that can be completed in 1-3 months.
    Format consistently as:
    1. Add personal project on <technology> and host it on GitHub.
    2. Complete certification/course <name> (Coursera, Udemy, LinkedIn Learning).
    3. Highlight <experience or skill> in resume with measurable impact.
    """
    response = model.generate_content(prompt)
    return response.text

# Function to format LLM output for UI/PDF
def format_for_ui_and_pdf(match_info: dict, recommendations: str) -> dict:
    clean_text = re.sub(r"^[\*\-\`\s]*", "", recommendations, flags=re.MULTILINE)
    clean_text = re.sub(r"\s*$", "", clean_text, flags=re.MULTILINE)

    lines = re.split(r'\n\d+\.\s+', clean_text)
    if len(lines) == 1:
        lines = [line.strip() for line in clean_text.split('\n') if line.strip()]
    else:
        lines = [line.strip() for line in lines if line.strip()]

    cleaned_lines = [re.sub(r'^\d+\.\s*', '', line) for line in lines]

    return {
        "match_percentage": match_info["match_percentage"],
        "matched_skills": match_info["matched_skills"],
        "missing_skills": match_info["missing_skills"],
        "recommendations": cleaned_lines,
        "estimated_time_saved_minutes": calculate_estimated_time_saved(match_info)
    }

# Function to export PDF
def export_to_pdf(formatted_data: dict) -> str:
    """
    Generate a premium-style Resume Optimization Report for HR/Recruiters.
    """
    # Create temp file
    pdf_fd, pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(pdf_fd)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=50,
        rightMargin=50,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()
    elements = []

    # ---------------- Custom Styles ---------------- #
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontSize=24,
        textColor=colors.HexColor("#1a73e8"),
        alignment=1,
        spaceAfter=35,
        leading=28
    )

    header_style = ParagraphStyle(
        "HeaderStyle",
        parent=styles["Heading2"],
        fontSize=16,
        textColor=colors.HexColor("#202124"),
        spaceBefore=22,
        spaceAfter=15,
        leading=18
    )

    normal_style = ParagraphStyle(
        "NormalStyle",
        parent=styles["Normal"],
        fontSize=11,
        leading=16,
        textColor=colors.HexColor("#3c4043"),
    )

    footer_style = ParagraphStyle(
        "FooterStyle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#5f6368"),
        alignment=1
    )

    # ---------------- Cover Title ---------------- #
    elements.append(Paragraph("Resume Optimization Report", title_style))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}", normal_style))
    elements.append(Spacer(1, 25))

    # ---------------- Executive Summary ---------------- #
    elements.append(Paragraph("Executive Summary", header_style))
    elements.append(Paragraph(
        f"This report evaluates the candidate’s resume against the target job role requirements. "
        f"It highlights matched skills, missing gaps, and provides actionable recommendations "
        f"to improve the candidate’s fit for MAANG-level roles or other high-impact companies.",
        normal_style
    ))
    elements.append(Spacer(1, 20))

    # ---------------- Skill Match Section with Chart ---------------- #
    elements.append(Paragraph("Skill Match Overview", header_style))
    elements.append(Paragraph(f"Overall Match: <b>{formatted_data['match_percentage']}%</b>", normal_style))
    elements.append(Spacer(1, 12))

    # Horizontal Progress Bar
    d = Drawing(400, 60)
    chart = HorizontalBarChart()
    chart.x = 40
    chart.y = 20
    chart.height = 20
    chart.width = 300
    chart.data = [[formatted_data["match_percentage"], 100 - formatted_data["match_percentage"]]]
    chart.bars[0].fillColor = colors.HexColor("#1a73e8")  # match
    chart.bars[1].fillColor = colors.HexColor("#e8eaed")  # background
    chart.bars[0].strokeColor = colors.HexColor("#1a73e8")
    chart.bars[1].strokeColor = colors.HexColor("#dadce0")
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = 100
    chart.valueAxis.visible = False
    chart.categoryAxis.visible = False
    d.add(chart)
    elements.append(d)
    elements.append(Spacer(1, 25))

    # ---------------- Skills Table ---------------- #
    elements.append(Paragraph("Skills Breakdown", header_style))
    matched = ", ".join(formatted_data["matched_skills"]) if formatted_data["matched_skills"] else "None"
    missing = ", ".join(formatted_data["missing_skills"]) if formatted_data["missing_skills"] else "None"

    data = [
        ["Matched Skills", matched],
        ["Missing Skills", missing],
    ]
    table = Table(data, colWidths=[150, 320])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#e6f4ea")),
        ("BACKGROUND", (0, 1), (0, 1), colors.HexColor("#fce8e6")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#202124")),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#dadce0")),
        ("INNERGRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#dadce0")),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 30))

    # ---------------- Recommendations ---------------- #
    elements.append(Paragraph("Actionable Recommendations", header_style))

    for i, rec in enumerate(formatted_data["recommendations"], start=1):
        # Categorize recommendation
        category = "General"
        rec_lower = rec.lower()
        color = colors.HexColor("#202124")  # default dark grey

        if any(x in rec_lower for x in ["course","certification","certificate","exam"]):
            category = "Certification"
            color = colors.HexColor("#34a853")  # green
        elif any(x in rec_lower for x in ["project","github","portfolio"]):
            category = "Project"
            color = colors.HexColor("#1a73e8")  # blue
        elif any(x in rec_lower for x in ["highlight","resume","experience","skills"]):
            category = "Skill"
            color = colors.HexColor("#fbbc05")  # orange

        # Use bullet (•) for unordered list or number for ordered list
        bullet = f"{i}."  # ordered
        # bullet = "•"  # uncomment for unordered

        # --- ADD THIS LINE: Markdown bold to ReportLab bold ---
        rec = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", rec)

        # Combine bullet + colored category + recommendation text
        para_text = f"{bullet} <b><font color='{color}'>{category}:</font></b> {rec}"
        
        # Add to elements
        elements.append(Paragraph(para_text, normal_style))
        elements.append(Spacer(1, 8))  # smaller spacing between items
        # After the recommendations loop
    estimated_time = formatted_data.get("estimated_time_saved_minutes", 0)
    elements.append(
        Paragraph(
            f"<font color='#202124'>&#9632;</font> <b>Estimated Time Saved: {estimated_time} minutes</b>", 
            normal_style
        )
    )
    elements.append(Spacer(1, 16))  # Optional extra space at the end

    # ---------------- Footer ---------------- #
    elements.append(PageBreak())
    elements.append(Spacer(1, 250))
    footer = Paragraph(
        "Generated by <b>OptiResume AI</b> – Empowering Smarter Career Growth", 
        footer_style
    )
    elements.append(footer)

    doc.build(elements)
    return pdf_path
