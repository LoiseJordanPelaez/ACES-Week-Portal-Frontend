import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "./acesweekportal.css";

class FormManager {
    constructor(data) {
        this.data = data;
    }

    validate(page) {
        const errors = [];
        const { mainCategory, subCategory, name, section, team, contact, gmail, submissionLink } = this.data;

        if (page === 1) {
            if (!mainCategory) errors.push("PLEASE SELECT A MAIN CATEGORY.");
            if (!subCategory) errors.push("PLEASE SELECT A SPECIFIC EVENT.");
        }
        if (page === 2) {
            if (!name) errors.push("FULL NAME IS REQUIRED.");
            if (!section) errors.push("PLEASE SELECT YOUR SECTION.");
            if (!team) errors.push("TEAM NAME IS REQUIRED.");
            if (!contact || !/^\+639\d{9}$/.test(contact)) errors.push("INVALID CONTACT NUMBER.");
            if (!gmail || !gmail.endsWith("@GMAIL.COM")) errors.push("A VALID @GMAIL.COM ADDRESS IS REQUIRED.");
        }
        if (page === 3) {
            if (!submissionLink) errors.push("REQUIREMENTS LINK IS REQUIRED.");
        }
        return errors;
    }

    generatePDF() {
        const doc = new jsPDF();
        const primaryColor = [128, 0, 0];
        const textColor = [40, 40, 40];
        const lightGray = [230, 230, 230];

        doc.setFillColor(...primaryColor); 
        doc.rect(0, 0, 210, 40, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(35);
        doc.text("ACES WEEK 2026", 105, 18, { align: "center" });
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic", "bold");
        doc.text("OFFICIAL REGISTRATION FORM", 105, 28, { align: "center" });
        
        doc.setTextColor(...textColor);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const date = new Date().toLocaleDateString();
        const refId = "REF-" + Math.random().toString(36).substr(2, 6).toUpperCase();
        doc.text(`DATE: ${date}`, 20, 50);
        doc.text(`REFERENCE NO: ${refId}`, 135, 50);

        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, 54, 190, 54);

        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.text("PARTICIPANT DETAILS", 20, 65);

        doc.setFontSize(11);
        doc.setTextColor(...textColor);
        doc.setFont("helvetica", "bold");
        doc.text("NAME:", 20, 75);
        doc.setFont("helvetica", "normal");
        doc.text(this.data.name || "N/A", 50, 75);
        doc.setFont("helvetica", "bold");
        doc.text("SECTION:", 20, 85);
        doc.setFont("helvetica", "normal");
        doc.text(this.data.section || "N/A", 50, 85);
        doc.setFont("helvetica", "bold");
        doc.text("TEAM:", 20, 95);
        doc.setFont("helvetica", "normal");
        doc.text(this.data.team || "N/A", 50, 95);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text("EVENT DETAILS", 20, 115);

        doc.setFontSize(11);
        doc.setTextColor(...textColor);
        let startY = 125;
        const skipKeys = ["name", "section", "contact", "team", "gmail", "submissionLink", "groupType"];
        Object.entries(this.data).forEach(([key, value]) => {
            if (value && !skipKeys.includes(key)) {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').toUpperCase();
                doc.setFont("helvetica", "bold");
                doc.text(`${formattedKey}:`, 20, startY);
                doc.setFont("helvetica", "normal");
                doc.text(`${value}`, 65, startY);
                startY += 10;
            }
        });

        doc.setFont("helvetica", "italic", "bold");
        startY += 25;
        doc.text("________________________________________________", 20, startY);
        doc.text("(SIGNATURE OVER PRINTED NAME OF PARTICIPANT)", 20, startY + 5);
        startY += 20;
        doc.text("________________________________________________", 20, startY);
        doc.text("(SIGNATURE OVER PRINTED NAME OF CLASS PRESIDENT)", 20, startY + 5);
        startY += 20;
        doc.text("________________________________________________", 20, startY);
        doc.text("(SIGNATURE OVER PRINTED NAME OF ACES PRESIDENT)", 20, startY + 5);

        doc.setFillColor(...lightGray);
        doc.rect(0, 275, 210, 25, "F");
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic", "bold");
        doc.text("ASSOCIATION OF COMPUTER ENGINEERING STUDENTS", 105, 285, { align: "center" });
        doc.text("POLYTECHNIC UNIVERSITY OF THE PHILIPPINES - BIÑAN CAMPUS", 105, 290, { align: "center" });

        doc.save(`ACES_REG_${this.data.name.replace(/\s+/g, '_')}.pdf`);
    }
}

const AcesWeekPortal = () => {
    const [view, setView] = useState("home"); 
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        mainCategory: "", subCategory: "", groupType: "",
        name: "", section: "", team: "", contact: "", gmail: "",
        role: "", position: "", jersey: "", matchType: "", ign: "", 
        esportsRole: "", bandName: "", instrument: "", artType: "", 
        quizCategory: "", essayLanguage: "", submissionLink: ""
    });

    const manager = new FormManager(formData);
    const sectionsList = ["BSCPE 1-1", "BSCPE 1-2", "BSCPE 2-1", "BSCPE 3-1", "BSCPE 4-1", "LADDERIZED", "DCPET 1-1", "DCPET 2-1", "DCPET 3-1"];
    const categoryTree = {
        "ACADEMICS": ["QUIZ BEE", "ESSAY WRITING"],
        "SPORTS": { "GROUP SPORTS": ["BASKETBALL", "VOLLEYBALL", "PALARONG LAHI"], "INDIVIDUAL SPORTS": ["BADMINTON", "TABLE TENNIS", "CHESS"] },
        "ESPORTS": ["TEKKEN", "MLBB", "CODM", "VALORANT"],
        "ARTS": ["BATTLE OF THE BANDS", "POSTER MAKING", "PHONE PHOTOGRAPHY"]
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value.toUpperCase() });
    };

    const handleNext = () => {
        const validationErrors = manager.validate(step);
        if (validationErrors.length > 0) {
            window.alert(validationErrors.join("\n"));
        } else {
            setStep(step + 1);
        }
    };

    if (view === "home") {
        return (
            <div className="aces-container">
                <h1 className="aces-title">ACES WEEK 2026</h1>
                <p className="aces-subtitle">THRONE OF CHAMPIONS PORTAL</p>
                <button className="aces-btn" onClick={() => setView("register")}>PARTICIPANT REGISTRATION</button>
                <button className="aces-btn aces-btn-outline" onClick={() => setView("admin")}>PLAYER DASHBOARD</button>
            </div>
        );
    }

    if (view === "admin") {
        return (
            <div className="aces-container aces-admin">
                <h1 className="aces-title">ADMIN DASHBOARD</h1>
                <table className="admin-table">
                    <thead><tr><th>NAME</th><th>SECTION</th><th>CATEGORY</th><th>STATUS</th></tr></thead>
                    <tbody>
                        <tr><td>JADE VILLANUEVA</td><td>BSCPE 4-1</td><td>ESPORTS - MLBB</td><td style={{color: '#4CAF50'}}>VERIFIED</td></tr>
                        <tr><td>KIM MENDOZA</td><td>BSCPE 4-1</td><td>ACADEMICS - QUIZ BEE</td><td style={{color: '#ff9f00'}}>PENDING</td></tr>
                    </tbody>
                </table>
                <button className="aces-btn aces-btn-outline" style={{marginTop: '30px'}} onClick={() => setView("home")}>RETURN HOME</button>
            </div>
        );
    }

    return (
        <div className="aces-container">
            <h1 className="aces-title">REGISTRATION</h1>
            <p className="aces-subtitle">STEP {step} OF 3</p>

            {step === 1 && (
                <div>
                    <select name="mainCategory" value={formData.mainCategory} onChange={(e) => setFormData({...formData, mainCategory: e.target.value.toUpperCase(), subCategory: "", groupType: ""})} className="aces-input">
                        <option value="">SELECT MAIN CATEGORY</option>
                        {Object.keys(categoryTree).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    {formData.mainCategory === "SPORTS" && (
                        <select name="groupType" value={formData.groupType} onChange={handleChange} className="aces-input">
                            <option value="">GROUP OR INDIVIDUAL?</option>
                            <option value="GROUP SPORTS">GROUP SPORTS</option>
                            <option value="INDIVIDUAL SPORTS">INDIVIDUAL SPORTS</option>
                        </select>
                    )}
                    {formData.mainCategory && (
                        <select name="subCategory" value={formData.subCategory} onChange={handleChange} className="aces-input">
                            <option value="">SELECT SPECIFIC EVENT</option>
                            {formData.mainCategory === "SPORTS" 
                                ? categoryTree.SPORTS[formData.groupType]?.map(sub => <option key={sub} value={sub}>{sub}</option>)
                                : categoryTree[formData.mainCategory]?.map(sub => <option key={sub} value={sub}>{sub}</option>)
                            }
                        </select>
                    )}
                    <hr className="aces-divider" />
                    <button className="aces-btn" onClick={handleNext}>NEXT</button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="FULL NAME" className="aces-input" />
                    <select name="section" value={formData.section} onChange={handleChange} className="aces-input">
                        <option value="">SELECT SECTION</option>
                        {sectionsList.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                    </select>
                    <input name="team" value={formData.team} onChange={handleChange} placeholder="TEAM / HOUSE NAME" className="aces-input" />
                    <input name="contact" value={formData.contact} onChange={handleChange} placeholder="CONTACT NUMBER" className="aces-input" />
                    <input name="gmail" value={formData.gmail} onChange={handleChange} placeholder="GMAIL ADDRESS" className="aces-input" />
                    <hr className="aces-divider" />
                    {formData.groupType === "GROUP SPORTS" && (
                        <>
                            <select name="role" value={formData.role} onChange={handleChange} className="aces-input">
                                <option value="">SELECT ROLE</option>
                                <option value="CAPTAIN">CAPTAIN</option>
                                <option value="CO-CAPTAIN">CO-CAPTAIN</option>
                                <option value="MEMBER">MEMBER</option>
                            </select>
                            <select name="position" value={formData.position} onChange={handleChange} className="aces-input">
                                <option value="">SELECT POSITION</option>
                                {formData.subCategory === "VOLLEYBALL" ? [1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>POSITION {n}</option>) : [1, 2, 3, 4, 5].map(n => <option key={n} value={n}>POSITION {n}</option>)}
                            </select>
                            <input name="jersey" type="number" value={formData.jersey} onChange={handleChange} placeholder="JERSEY NUMBER" className="aces-input" />
                        </>
                    )}
                    {formData.groupType === "INDIVIDUAL SPORTS" && (
                        <>
                            <select name="matchType" value={formData.matchType} onChange={handleChange} className="aces-input">
                                <option value="">SELECT TYPE</option>
                                <option value="SINGLES">SINGLES</option>
                                <option value="DOUBLES">DOUBLES</option>
                            </select>
                            <input name="jersey" type="number" value={formData.jersey} onChange={handleChange} placeholder="JERSEY NUMBER" className="aces-input" />
                        </>
                    )}
                    {formData.mainCategory === "ESPORTS" && (
                        <>
                            <input name="ign" value={formData.ign} onChange={handleChange} placeholder="IN-GAME NAME" className="aces-input" />
                            <input name="esportsRole" value={formData.esportsRole} onChange={handleChange} placeholder="ROLE / HERO" className="aces-input" />
                        </>
                    )}
                    {formData.subCategory === "BATTLE OF THE BANDS" && (
                        <>
                            <input name="bandName" value={formData.bandName} onChange={handleChange} placeholder="BAND NAME" className="aces-input" />
                            <input name="instrument" value={formData.instrument} onChange={handleChange} placeholder="INSTRUMENT / ROLE" className="aces-input" />
                        </>
                    )}
                    {formData.subCategory === "POSTER MAKING" && (
                        <select name="artType" value={formData.artType} onChange={handleChange} className="aces-input">
                            <option value="">SELECT TYPE</option>
                            <option value="DIGITAL">DIGITAL</option>
                            <option value="TRADITIONAL">TRADITIONAL</option>
                        </select>
                    )}
                    {formData.subCategory === "QUIZ BEE" && (
                        <select name="quizCategory" value={formData.quizCategory} onChange={handleChange} className="aces-input">
                            <option value="">SELECT QUIZ CATEGORY</option>
                            <option value="ICT">ICT</option><option value="MATHEMATICS">MATHEMATICS</option><option value="SCIENCE">SCIENCE</option><option value="GENERAL INFO">GENERAL INFO</option>
                        </select>
                    )}
                    {formData.subCategory === "ESSAY WRITING" && (
                        <select name="essayLanguage" value={formData.essayLanguage} onChange={handleChange} className="aces-input">
                            <option value="">SELECT LANGUAGE</option><option value="ENGLISH">ENGLISH</option><option value="TAGALOG">TAGALOG</option>
                        </select>
                    )}
                    <div className="aces-btn-group">
                        <button className="aces-btn aces-btn-outline" onClick={() => setStep(1)}>BACK</button>
                        <button className="aces-btn" onClick={handleNext}>NEXT</button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div>
                    <div style={{backgroundColor: "rgba(0,0,0,0.5)", padding: "15px", borderRadius: "8px", marginBottom: "20px"}}>
                        <p style={{color: "#ffffff", fontWeight: "bold", margin: "0 0 10px 0"}}>SUBMIT SOFTCOPY OF REQUIREMENTS:</p>
                    </div>
                    <input name="submissionLink" value={formData.submissionLink} onChange={handleChange} placeholder="SUBMISSION LINK" className="aces-input" />
                    <button className="aces-btn" style={{background: "transparent", color: "#ff4d4d", border: "2px solid #800000", boxShadow: "none"}} onClick={() => manager.generatePDF()}>DOWNLOAD REGISTRATION FORM (PDF)</button>
                    <hr className="aces-divider" />
                    <div className="aces-btn-group">
                        <button className="aces-btn aces-btn-outline" onClick={() => setStep(2)}>BACK</button>
                        <button className="aces-btn" onClick={() => { window.alert("REGISTRATION SUBMITTED!"); setView("home"); }}>FINAL SUBMIT</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcesWeekPortal;
