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
    const awards = application.awards || [];
    const otherDetails = application.other_details || {};
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
                    </tbody>
                </table>
            </div>

            {/* 3b. FUNDED RESEARCH PROJECTS & CONSULTANCY */}
            {((application.research_projects && application.research_projects.length > 0) || (application.funded_consultancy && application.funded_consultancy.length > 0) || (application.journal_publications && application.journal_publications.length > 0)) && (
                <div className="pdf-section">
                    <h3 className="pdf-section-heading">3b. Research Projects, Consultancy &amp; Journal Publications</h3>
                    {application.research_projects && application.research_projects.length > 0 && (
                        <div style={{ marginBottom: '0.8rem' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.3rem' }}>Funded Research Projects</h4>
                            <table className="pdf-table data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '5%', textAlign: 'center' }}>S.No</th>
                                        <th style={{ width: '15%' }}>PI Name</th>
                                        <th style={{ width: '12%' }}>Co-PI Names</th>
                                        <th style={{ width: '22%' }}>Project Title</th>
                                        <th style={{ width: '12%' }}>Industry</th>
                                        <th style={{ width: '12%' }}>Duration</th>
                                        <th style={{ width: '10%' }}>Amount (₹)</th>
                                        <th style={{ width: '12%' }}>Organization</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {application.research_projects.map((proj, idx) => (
                                        <tr key={idx}>
                                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                            <td>{proj.pi_name || 'N/A'}</td>
                                            <td>{proj.co_pi_names || 'None'}</td>
                                            <td><strong>{proj.project_title}</strong></td>
                                            <td>{proj.industry || '-'}</td>
                                            <td>
                                                {proj.from_date && proj.to_date
                                                    ? `${new Date(proj.from_date).toLocaleDateString('en-US')} - ${new Date(proj.to_date).toLocaleDateString('en-US')}`
                                                    : proj.year || '-'}
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#047857' }}>
                                                {proj.amount ? `₹${parseFloat(proj.amount).toLocaleString('en-IN')}` : 'N/A'}
                                            </td>
                                            <td>{proj.funding_agency || proj.organization || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {application.funded_consultancy && application.funded_consultancy.length > 0 && (
                        <div style={{ marginBottom: '0.8rem' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857', marginBottom: '0.3rem' }}>Funded Consultancy Assignments</h4>
                            <table className="pdf-table data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '5%', textAlign: 'center' }}>S.No</th>
                                        <th style={{ width: '15%' }}>PI / Consultant</th>
                                        <th style={{ width: '12%' }}>Co-PI / Team</th>
                                        <th style={{ width: '22%' }}>Consultancy Title</th>
                                        <th style={{ width: '12%' }}>Industry</th>
                                        <th style={{ width: '12%' }}>Duration</th>
                                        <th style={{ width: '10%' }}>Amount (₹)</th>
                                        <th style={{ width: '12%' }}>Client Org</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {application.funded_consultancy.map((cons, idx) => (
                                        <tr key={idx}>
                                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                            <td>{cons.pi_name || 'N/A'}</td>
                                            <td>{cons.co_pi_names || 'None'}</td>
                                            <td><strong>{cons.consultancy_title}</strong></td>
                                            <td>{cons.industry || '-'}</td>
                                            <td>
                                                {cons.from_date && cons.to_date
                                                    ? `${new Date(cons.from_date).toLocaleDateString('en-US')} - ${new Date(cons.to_date).toLocaleDateString('en-US')}`
                                                    : cons.year || '-'}
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#047857' }}>
                                                {cons.amount ? `₹${parseFloat(cons.amount).toLocaleString('en-IN')}` : 'N/A'}
                                            </td>
                                            <td>{cons.client_org || cons.organization || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {application.journal_publications && application.journal_publications.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6d28d9', marginBottom: '0.3rem' }}>Journal Publications (SCI &amp; Scopus)</h4>
                            <table className="pdf-table data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '5%', textAlign: 'center' }}>S.No</th>
                                        <th style={{ width: '10%' }}>Type</th>
                                        <th style={{ width: '30%' }}>Paper Title</th>
                                        <th style={{ width: '22%' }}>Journal &amp; Publisher</th>
                                        <th style={{ width: '15%' }}>Vol / DOI</th>
                                        <th style={{ width: '10%' }}>Date</th>
                                        <th style={{ width: '8%' }}>Impact Factor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {application.journal_publications.map((pub, idx) => (
                                        <tr key={idx}>
                                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                            <td style={{ textAlign: 'center', fontWeight: 700, color: pub.journal_type === 'Scopus' ? '#047857' : '#4338ca' }}>
                                                {pub.journal_type || 'SCI'}
                                            </td>
                                            <td><strong>{pub.paper_title}</strong></td>
                                            <td>{pub.journal_name} {pub.publisher ? `(${pub.publisher})` : ''}</td>
                                            <td>{pub.vol_no || pub.doi || '-'}</td>
                                            <td>{pub.publication_date ? new Date(pub.publication_date).toLocaleDateString('en-GB') : '-'}</td>
                                            <td style={{ textAlign: 'center', fontWeight: 700 }}>{pub.impact_factor || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

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

            {/* 8b. AWARDS, FAMILY DETAILS & REFERENCES */}
            {(awards.length > 0 || otherDetails.ref1_name || otherDetails.spouse_name || otherDetails.other_achievements) && (
                <div className="pdf-section">
                    <h3 className="pdf-section-heading">6. Awards, Family Background &amp; References</h3>

                    {awards.length > 0 && (
                        <div style={{ marginBottom: '0.8rem' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d97706', marginBottom: '0.3rem' }}>Honors &amp; Awards Received</h4>
                            <table className="pdf-table data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '5%' }}>#</th>
                                        <th style={{ width: '35%' }}>Award Title</th>
                                        <th style={{ width: '30%' }}>Awarding Organization</th>
                                        <th style={{ width: '15%' }}>Category</th>
                                        <th style={{ width: '15%' }}>Year</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {awards.map((aw, idx) => (
                                        <tr key={idx}>
                                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                            <td><strong>{aw.title}</strong></td>
                                            <td>{aw.organization || aw.awarding_body || 'N/A'}</td>
                                            <td>{aw.category || 'National'}</td>
                                            <td style={{ textAlign: 'center' }}>{aw.year || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <table className="pdf-table">
                        <tbody>
                            <tr>
                                <th style={{ width: '22%' }}>Spouse Name &amp; Occupation</th>
                                <td style={{ width: '28%' }}>
                                    {otherDetails.spouse_name ? `${otherDetails.spouse_name} (${otherDetails.spouse_occupation || 'N/A'})` : 'N/A'}
                                </td>
                                <th style={{ width: '22%' }}>Children / Dependents</th>
                                <td style={{ width: '28%' }}>
                                    {otherDetails.no_of_children || 0} Children / {otherDetails.no_of_dependents || 0} Dependents
                                </td>
                            </tr>
                            <tr>
                                <th>Father's Occupation</th>
                                <td>{otherDetails.father_occupation || 'N/A'}</td>
                                <th>Mother's Occupation</th>
                                <td>{otherDetails.mother_occupation || 'N/A'}</td>
                            </tr>
                            {otherDetails.ref1_name && (
                                <tr>
                                    <th>Referee 1</th>
                                    <td colSpan="3">
                                        <strong>{otherDetails.ref1_name}</strong> ({otherDetails.ref1_designation}, {otherDetails.ref1_org}) — Ph: {otherDetails.ref1_phone || 'N/A'} | Email: {otherDetails.ref1_email || 'N/A'}
                                    </td>
                                </tr>
                            )}
                            {otherDetails.ref2_name && (
                                <tr>
                                    <th>Referee 2</th>
                                    <td colSpan="3">
                                        <strong>{otherDetails.ref2_name}</strong> ({otherDetails.ref2_designation}, {otherDetails.ref2_org}) — Ph: {otherDetails.ref2_phone || 'N/A'} | Email: {otherDetails.ref2_email || 'N/A'}
                                    </td>
                                </tr>
                            )}
                            {otherDetails.other_achievements && (
                                <tr>
                                    <th>Other Accomplishments</th>
                                    <td colSpan="3">{otherDetails.other_achievements}</td>
                                </tr>
                            )}
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
