import React from 'react';
import { createPortal } from 'react-dom';

/**
 * PrintableApplicationForm
 * Generates a formal, professional recruitment application document for PDF export.
 * Features deduplication for education, experience, and certifications.
 * Uses ReactDOM.createPortal to attach directly to document.body so @media print CSS
 * can completely isolate this document and hide all other app DOM elements.
 */
export const PrintableApplicationForm = ({ application, score }) => {
    if (!application) return null;

    const p = application.personal || application || {};
    const rawEdu = application.education || [];
    const rawExp = application.experience || [];
    const rawCerts = application.certifications || [];
    const phd = application.phd_details || {};
    const evalScore = score || application.score || null;

    // Deduplication helper for array records
    const dedupeArray = (arr, keyFn) => {
        const seen = new Set();
        return (arr || []).filter((item) => {
            const key = keyFn(item);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    const edu = dedupeArray(rawEdu, (e) => `${e.qual_type || ''}_${e.degree || ''}_${e.year_of_passing || ''}`);
    const exp = dedupeArray(rawExp, (e) => `${e.designation || ''}_${e.org_name || ''}_${e.from_date || ''}`);
    const certs = dedupeArray(rawCerts, (c) => `${c.title || ''}_${c.organization || ''}_${c.year || ''}`);

    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const candidateName = p.full_name || 'N/A';
    const postApplied = p.post || application.post || 'Assistant Professor';
    const department = application.department || p.department || 'N/A';
    const appliedDate = p.applied_date ? String(p.applied_date).substring(0, 10) : currentDate;
    const isFresher = exp.length === 0 || (exp.length === 1 && exp[0].is_fresher === 1);

    const pdfContent = (
        <div id="printable-pdf-document" className="printable-document-root">
            {/* 1. OFFICIAL INSTITUTION HEADER */}
            <div className="pdf-header-container">
                <div className="pdf-header-logo-area">
                    <img src="/logo.png" alt="NEC Logo" className="pdf-logo-img" onError={(e) => { e.target.style.display = 'none'; }} />
                    <div>
                        <h1 className="pdf-college-title">NATIONAL ENGINEERING COLLEGE</h1>
                        <p className="pdf-college-subtitle">(An Autonomous Institution, Affiliated to Anna University, Chennai)</p>
                        <p className="pdf-college-address">Kovilpatti, Thoothukudi District, Tamil Nadu — 628 503</p>
                        <p className="pdf-college-web">Web: www.nec.edu.in | Email: principal@nec.edu.in</p>
                    </div>
                </div>
            </div>

            {/* 2. FORMAL DOCUMENT HEADER & PRIMARY METADATA BANNER */}
            <div className="pdf-doc-banner">
                <div>
                    <h2 className="pdf-doc-title">STAFF RECRUITMENT APPLICATION FORM</h2>
                    <div style={{ fontSize: '9pt', color: '#1e3a8a', fontWeight: 700, marginTop: '2px' }}>
                        Applied Post: {postApplied} | Department: {department}
                    </div>
                </div>
                <div className="pdf-doc-meta" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span><strong>Application No:</strong> NEC/REC/2026/{(p.user_email || 'CAND').split('@')[0].toUpperCase()}</span>
                    <span><strong>Date of Application:</strong> {appliedDate}</span>
                </div>
            </div>

            {/* 3. CANDIDATE PRIMARY HIGHLIGHT BOX & PASSPORT PHOTO */}
            <div className="pdf-section-wrapper">
                <div className="pdf-overview-grid">
                    <div className="pdf-overview-details">
                        <table className="pdf-table compact-table">
                            <tbody>
                                <tr>
                                    <th style={{ width: '26%' }}>Full Name of Candidate</th>
                                    <td colSpan="3" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                                        {candidateName}
                                    </td>
                                </tr>
                                <tr>
                                    <th style={{ width: '26%' }}>Post Applied For</th>
                                    <td style={{ width: '24%', fontWeight: 700, color: '#1e3a8a' }}>{postApplied}</td>
                                    <th style={{ width: '26%' }}>Department</th>
                                    <td style={{ width: '24%', fontWeight: 700, color: '#1e3a8a' }}>{department}</td>
                                </tr>
                                <tr>
                                    <th>Date of Application</th>
                                    <td style={{ fontWeight: 700, color: '#047857' }}>{appliedDate}</td>
                                    <th>Application ID</th>
                                    <td style={{ fontWeight: 700 }}>NEC/2026/{(p.user_email || 'CAND').split('@')[0].toUpperCase()}</td>
                                </tr>
                                <tr>
                                    <th>Email Address</th>
                                    <td>{p.user_email || p.email || 'N/A'}</td>
                                    <th>Contact Phone</th>
                                    <td>{p.phone || 'N/A'} {p.whatsapp ? `/ ${p.whatsapp}` : ''}</td>
                                </tr>
                                <tr>
                                    <th>Date of Birth &amp; Age</th>
                                    <td>
                                        {p.dob ? String(p.dob).substring(0, 10) : 'N/A'}{' '}
                                        {p.age ? `(${p.age} Yrs)` : ''}
                                    </td>
                                    <th>Gender / Blood Group</th>
                                    <td>{p.gender || 'N/A'} {p.blood_group ? `(${p.blood_group})` : ''}</td>
                                </tr>
                                <tr>
                                    <th>Community &amp; Caste</th>
                                    <td>
                                        <strong style={{ color: '#0284c7' }}>{p.community || 'N/A'}</strong>{' '}
                                        {p.caste ? `(${p.caste})` : ''}
                                    </td>
                                    <th>Marital Status</th>
                                    <td>{p.marital_status || 'N/A'} {p.spouse_name ? `(Spouse: ${p.spouse_name})` : ''}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="pdf-photo-box">
                        {p.photo_path ? (
                            <img src={p.photo_path} alt="Candidate" className="pdf-photo-img" />
                        ) : (
                            <div className="pdf-photo-placeholder">
                                <span>Passport Size Photo</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. PERSONAL & FAMILY DETAILS */}
            <div className="pdf-section">
                <h3 className="pdf-section-heading">1. Personal &amp; Contact Information</h3>
                <table className="pdf-table">
                    <tbody>
                        <tr>
                            <th style={{ width: '22%' }}>Father's Name</th>
                            <td style={{ width: '28%' }}>{p.father_name || 'N/A'}</td>
                            <th style={{ width: '22%' }}>Mother's Name</th>
                            <td style={{ width: '28%' }}>{p.mother_name || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Nationality / Religion</th>
                            <td>{p.nationality || 'Indian'} / {p.religion || 'N/A'}</td>
                            <th>Aadhaar Number</th>
                            <td>{p.aadhaar || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>Communication Address</th>
                            <td>{p.communication_address || p.permanent_address || 'N/A'}</td>
                            <th>Permanent Address</th>
                            <td>{p.permanent_address || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th>State / District / Pincode</th>
                            <td colSpan="3">{p.state || 'Tamil Nadu'} / {p.district || 'N/A'} / {p.pincode || 'N/A'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 5. EDUCATIONAL QUALIFICATIONS */}
            <div className="pdf-section">
                <h3 className="pdf-section-heading">2. Educational Qualifications</h3>
                <table className="pdf-table data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '10%' }}>Level</th>
                            <th style={{ width: '22%' }}>Degree / Specialization</th>
                            <th style={{ width: '36%' }}>Institution / University</th>
                            <th style={{ width: '12%' }}>Year</th>
                            <th style={{ width: '10%' }}>Marks %</th>
                            <th style={{ width: '10%' }}>Class</th>
                        </tr>
                    </thead>
                    <tbody>
                        {edu.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>No educational qualification details recorded.</td>
                            </tr>
                        ) : (
                            edu.map((e, idx) => (
                                <tr key={idx}>
                                    <td style={{ textTransform: 'uppercase', fontWeight: 700 }}>{e.qual_type || 'qual'}</td>
                                    <td>
                                        <strong>{e.degree || e.qual_type}</strong>
                                        {e.specialization ? <div style={{ fontSize: '0.78rem', color: '#475569' }}>{e.specialization}</div> : null}
                                    </td>
                                    <td>{e.institution_name || 'N/A'}</td>
                                    <td style={{ textAlign: 'center' }}>{e.year_of_passing || 'N/A'}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>
                                        {e.percentage ? `${e.percentage}%` : 'N/A'}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{e.first_class === 'Yes' ? '1st Class' : 'Pass'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 6. RESEARCH & PH.D DETAILS */}
            <div className="pdf-section">
                <h3 className="pdf-section-heading">3. Ph.D &amp; Research Contributions</h3>
                <table className="pdf-table">
                    <tbody>
                        <tr>
                            <th style={{ width: '22%' }}>Ph.D Status</th>
                            <td style={{ width: '28%', fontWeight: 700 }}>{phd.phd_status || p.phd_status || 'N/A'}</td>
                            <th style={{ width: '22%' }}>University</th>
                            <td style={{ width: '28%' }}>{phd.university || 'N/A'}</td>
                        </tr>
                        {phd.title && (
                            <tr>
                                <th>Thesis Title</th>
                                <td colSpan="3"><em>"{phd.title}"</em></td>
                            </tr>
                        )}
                        <tr>
                            <th>Publications (SCI/Scopus)</th>
                            <td>{phd.publications ?? phd.no_of_publications_during_phd ?? 0}</td>
                            <th>Awards Received</th>
                            <td>{phd.no_of_awards ?? 0}</td>
                        </tr>
                        <tr>
                            <th>Funded Projects</th>
                            <td>{phd.no_of_funded_projects ?? 0}</td>
                            <th>Funded Consultancy</th>
                            <td>{phd.no_of_funded_consultancy ?? 0}</td>
                        </tr>
                        <tr>
                            <th>Guided Ph.D Scholars</th>
                            <td>{phd.guided_phd_scholars ?? 0}</td>
                            <th>Patents Granted/Filed</th>
                            <td>{phd.patents ?? 0}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 7. WORK EXPERIENCE */}
            <div className="pdf-section">
                <h3 className="pdf-section-heading">4. Professional Work Experience</h3>
                {isFresher ? (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', margin: '0.4rem 0' }}>
                        Fresher Candidate (No prior academic / industrial experience recorded).
                    </p>
                ) : (
                    <table className="pdf-table data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>#</th>
                                <th style={{ width: '25%' }}>Designation</th>
                                <th style={{ width: '35%' }}>Organization / Institution</th>
                                <th style={{ width: '15%' }}>Type</th>
                                <th style={{ width: '20%' }}>Period &amp; Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exp.map((ex, idx) => (
                                <tr key={idx}>
                                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                    <td><strong>{ex.designation || 'N/A'}</strong></td>
                                    <td>{ex.org_name || 'N/A'}</td>
                                    <td>{ex.exp_type || 'Teaching'}</td>
                                    <td>
                                        <div>{ex.from_date ? String(ex.from_date).substring(0, 10) : ''} to {ex.to_date ? String(ex.to_date).substring(0, 10) : 'Present'}</div>
                                        <div style={{ fontWeight: 700, color: '#0284c7', fontSize: '0.78rem' }}>Duration: {ex.total_duration || 'N/A'}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* 8. CERTIFICATIONS & NPTEL */}
            {certs.length > 0 && (
                <div className="pdf-section">
                    <h3 className="pdf-section-heading">5. Certifications &amp; NPTEL Courses</h3>
                    <table className="pdf-table data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Course / Certification Title</th>
                                <th style={{ width: '30%' }}>Conducting Body</th>
                                <th style={{ width: '15%' }}>Year</th>
                                <th style={{ width: '15%' }}>Score %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certs.map((c, idx) => (
                                <tr key={idx}>
                                    <td><strong>{c.title}</strong> {c.category ? `(${c.category})` : ''}</td>
                                    <td>{c.organization || 'N/A'}</td>
                                    <td style={{ textAlign: 'center' }}>{c.year || 'N/A'}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>{c.score || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 9. AUTOMATED EVALUATION SCORE BREAKDOWN (Admin Copy) */}
            {evalScore && (
                <div className="pdf-section">
                    <h3 className="pdf-section-heading">6. Automated Scoring Evaluation Summary</h3>
                    <div className="pdf-score-banner">
                        <span><strong>Total Evaluated Merit Score:</strong></span>
                        <span className="pdf-score-val">{evalScore.total || 0} / 100 Points</span>
                    </div>
                    {evalScore.breakdown && evalScore.breakdown.length > 0 && (
                        <table className="pdf-table data-table compact-table" style={{ marginTop: '0.5rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '75%' }}>Evaluation Parameter Key</th>
                                    <th style={{ width: '25%', textAlign: 'right' }}>Scored Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {evalScore.breakdown.map((b, idx) => (
                                    <tr key={idx}>
                                        <td>{b.parameter_name}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, color: b.score > 0 ? '#16a34a' : '#64748b' }}>
                                            +{b.score} pts
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* 10. DECLARATION & SIGNATURE BLOCK */}
            <div className="pdf-declaration-section">
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', color: '#0f172a' }}>
                    Declaration
                </h4>
                <p className="pdf-declaration-text">
                    I hereby declare that all the information provided in this application form is true, complete and correct to the best of my knowledge and belief. In the event of any information being found false or incorrect at any stage, my candidature / appointment is liable to be cancelled without any notice.
                </p>

                <div className="pdf-signature-grid">
                    <div className="pdf-sig-box">
                        <div className="pdf-sig-line"></div>
                        <div className="pdf-sig-label">Date &amp; Place</div>
                    </div>
                    <div className="pdf-sig-box" style={{ textAlign: 'right' }}>
                        <div className="pdf-sig-line"></div>
                        <div className="pdf-sig-label">Signature of the Candidate</div>
                        <div className="pdf-sig-sub">({candidateName})</div>
                    </div>
                </div>

                <div className="pdf-official-sign-section">
                    <div className="pdf-official-sig-box">
                        <div className="pdf-sig-line"></div>
                        <div className="pdf-sig-label">Scrutiny Committee Officer</div>
                    </div>
                    <div className="pdf-official-sig-box">
                        <div className="pdf-sig-line"></div>
                        <div className="pdf-sig-label">Head of Department (HOD)</div>
                    </div>
                    <div className="pdf-official-sig-box">
                        <div className="pdf-sig-line"></div>
                        <div className="pdf-sig-label">Principal / Director</div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(pdfContent, document.body);
};

export default PrintableApplicationForm;
