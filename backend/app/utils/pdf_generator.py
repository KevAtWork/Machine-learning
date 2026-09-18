import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_medical_report_pdf(patient_data: dict, prediction_results: dict) -> io.BytesIO:
    """Generates a professional PDF report for cardiovascular predictions.
    
    patient_data contains raw inputs: age_years, gender, height, weight, ap_hi, ap_lo, cholesterol, gluc, smoke, alco, active.
    prediction_results contains: result_probability, risk_level, confidence_score, risk_factors, protective_factors, recommendations.
    """
    buffer = io.BytesIO()
    
    # Page setup
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom Palette
    primary_color = colors.HexColor("#0F172A") # Slate 900
    accent_color = colors.HexColor("#6366F1")  # Indigo 500
    text_color = colors.HexColor("#334155")    # Slate 700
    border_color = colors.HexColor("#E2E8F0")  # Slate 200
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=15
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=accent_color,
        spaceBefore=15,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=text_color
    )
    
    bold_body_style = ParagraphStyle(
        'BoldBodyText',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    # Define Alert Colors for Risk
    risk_level = prediction_results['risk_level'].upper()
    if risk_level == "CRITICAL":
        alert_bg = colors.HexColor("#FEE2E2") # red-100
        alert_text = colors.HexColor("#991B1B") # red-800
    elif risk_level == "HIGH":
        alert_bg = colors.HexColor("#FEF3C7") # amber-100
        alert_text = colors.HexColor("#92400E") # amber-800
    elif risk_level == "MODERATE":
        alert_bg = colors.HexColor("#EFF6FF") # blue-100
        alert_text = colors.HexColor("#1E40AF") # blue-800
    else:
        alert_bg = colors.HexColor("#DCFCE7") # green-100
        alert_text = colors.HexColor("#166534") # green-800

    alert_style = ParagraphStyle(
        'AlertText',
        parent=body_style,
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=alert_text,
        alignment=1 # Center aligned
    )

    # 1. Header Banner Table
    header_data = [
        [Paragraph("CARDIOPREDICT AI", title_style), Paragraph(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", body_style)],
        [Paragraph("CLINICAL CARDIOVASCULAR HEALTH ASSESSMENT REPORT", subtitle_style), ""]
    ]
    header_table = Table(header_data, colWidths=[4.0*inch, 3.5*inch])
    header_table.setStyle(TableStyle([
        ('SPAN', (0, 1), (1, 1)),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    
    # Horizontal Divider Line
    divider_table = Table([[""]], colWidths=[7.5*inch])
    divider_table.setStyle(TableStyle([
        ('LINEABOVE', (0, 0), (-1, -1), 1.5, primary_color),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(divider_table)
    
    # 2. Patient Demographics & Health Profile
    story.append(Paragraph("Patient Physiological Profile", section_heading))
    
    gender_label = "Male" if patient_data['gender'] == 2 else "Female"
    cholesterol_labels = ["Normal", "Above Normal", "Well Above Normal"]
    gluc_labels = ["Normal", "Above Normal", "Well Above Normal"]
    
    profile_data = [
        [
            Paragraph("Age:", bold_body_style), Paragraph(f"{patient_data['age_years']:.1f} years", body_style),
            Paragraph("Systolic BP:", bold_body_style), Paragraph(f"{patient_data['ap_hi']} mmHg", body_style),
        ],
        [
            Paragraph("Gender:", bold_body_style), Paragraph(gender_label, body_style),
            Paragraph("Diastolic BP:", bold_body_style), Paragraph(f"{patient_data['ap_lo']} mmHg", body_style),
        ],
        [
            Paragraph("Height:", bold_body_style), Paragraph(f"{patient_data['height']} cm", body_style),
            Paragraph("Cholesterol:", bold_body_style), Paragraph(cholesterol_labels[patient_data['cholesterol'] - 1], body_style),
        ],
        [
            Paragraph("Weight:", bold_body_style), Paragraph(f"{patient_data['weight']} kg", body_style),
            Paragraph("Glucose:", bold_body_style), Paragraph(gluc_labels[patient_data['gluc'] - 1], body_style),
        ],
        [
            Paragraph("Smoker:", bold_body_style), Paragraph("Yes" if patient_data['smoke'] else "No", body_style),
            Paragraph("Alcohol Intake:", bold_body_style), Paragraph("Yes" if patient_data['alco'] else "No", body_style),
        ],
        [
            Paragraph("Physically Active:", bold_body_style), Paragraph("Yes" if patient_data['active'] else "No", body_style),
            Paragraph("", body_style), Paragraph("", body_style),
        ]
    ]
    
    profile_table = Table(profile_data, colWidths=[1.5*inch, 2.25*inch, 1.5*inch, 2.25*inch])
    profile_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(profile_table)
    story.append(Spacer(1, 15))
    
    # 3. Prediction Results & Alert Banner
    story.append(Paragraph("Cardiovascular Disease Risk Assessment", section_heading))
    
    risk_summary_text = (
        f"Based on our machine learning diagnostic models, the patient's likelihood of "
        f"having cardiovascular disease is estimated at <b>{prediction_results['result_probability'] * 100:.1f}%</b>. "
        f"The prediction has a diagnostic confidence score of <b>{prediction_results['confidence_score'] * 100:.1f}%</b>."
    )
    story.append(Paragraph(risk_summary_text, body_style))
    story.append(Spacer(1, 10))
    
    # Alert Box Table
    alert_box = Table([[Paragraph(f"RISK CATEGORY: {risk_level}", alert_style)]], colWidths=[7.5*inch])
    alert_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), alert_bg),
        ('BOX', (0, 0), (-1, -1), 1, alert_text),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(alert_box)
    story.append(Spacer(1, 15))
    
    # 4. Explainable AI: High Impact Risk Factors (SHAP Contributions)
    story.append(Paragraph("Key Biomarker Contribution Analysis (Explainable AI)", section_heading))
    story.append(Paragraph(
        "Using SHAP (SHapley Additive exPlanations) values, we have isolated the specific indicators "
        "that contributed most strongly to the risk classification.", body_style
    ))
    story.append(Spacer(1, 6))
    
    # Risk factors table
    explain_data = [[
        Paragraph("Risk Amplification Factors (Increases Risk)", bold_body_style),
        Paragraph("Protective Factors (Reduces Risk)", bold_body_style)
    ]]
    
    risk_list = []
    for r in prediction_results['risk_factors'][:4]:
        risk_list.append(f"• {r['display_name']} (Value: {r['raw_value']})")
    if not risk_list:
        risk_list.append("None detected")
        
    prot_list = []
    for p in prediction_results['protective_factors'][:4]:
        prot_list.append(f"• {p['display_name']} (Value: {p['raw_value']})")
    if not prot_list:
        prot_list.append("None detected")
        
    explain_data.append([
        Paragraph("<br/>".join(risk_list), body_style),
        Paragraph("<br/>".join(prot_list), body_style)
    ])
    
    explain_table = Table(explain_data, colWidths=[3.75*inch, 3.75*inch])
    explain_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor("#FEE2E2")),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor("#DCFCE7")),
        ('LINEBELOW', (0, 0), (-1, 0), 1, primary_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(explain_table)
    story.append(Spacer(1, 15))
    
    # 5. Recommendations
    story.append(Paragraph("Clinical & Lifestyle Recommendations", section_heading))
    rec_paragraphs = []
    for rec in prediction_results['recommendations']:
        rec_paragraphs.append(f"• {rec}")
    story.append(Paragraph("<br/>".join(rec_paragraphs), body_style))
    story.append(Spacer(1, 20))
    
    # 6. Disclaimer and Signature Sign-off
    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=body_style,
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#94A3B8"),
        alignment=4 # Justified
    )
    
    disclaimer_text = (
        "DISCLAIMER: This diagnostic report is generated by an artificial intelligence predictive "
        "model (CardioPredict AI) using clinical research data. It is intended for educational and "
        "screening purposes only, and should not be interpreted as final clinical advice or a direct substitute "
        "for a professional medical consultation or cardiovascular diagnostic tests. Please share these "
        "findings with a licensed medical practitioner."
    )
    story.append(Paragraph(disclaimer_text, disclaimer_style))
    story.append(Spacer(1, 25))
    
    # Signature line
    sig_data = [
        ["", "____________________________________"],
        ["", "Medical Practitioner / Reviewer Signature"]
    ]
    sig_table = Table(sig_data, colWidths=[4.0*inch, 3.5*inch])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('FONTNAME', (1, 1), (1, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (1, 1), (1, 1), 9),
        ('TEXTCOLOR', (1, 1), (1, 1), colors.HexColor("#64748B")),
    ]))
    story.append(sig_table)
    
    # Build Document
    doc.build(story)
    
    buffer.seek(0)
    return buffer
