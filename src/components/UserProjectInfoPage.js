import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./AdminDashboard.css";
import { API_BASE_URL } from "../api";

import logo from "../assets/klonlogo.png";
import { FaHome } from "react-icons/fa";
import { FaLink, FaDesktop } from "react-icons/fa6";
import { VscTools } from "react-icons/vsc";
import { LuCalendar } from "react-icons/lu";
import { FiBell } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";

function UserProjectInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // New detailed fields
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [brandingGuidelines, setBrandingGuidelines] = useState("");
  const [clientLogoUrl, setClientLogoUrl] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [aboutServices, setAboutServices] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [serviceLocations, setServiceLocations] = useState("");
  const [usp, setUsp] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [altContact, setAltContact] = useState("");
  const [address, setAddress] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false); // default: view mode
  const [step, setStep] = useState(1); // 1 = business info, 2 = contact & address

  const projectNameFromState = location.state?.projectName;

  // Load project + info
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        setLoadError("");
        setSaveSuccess("");

        const res = await fetch(`${API_BASE_URL}/api/projects`);
        if (!res.ok) {
          throw new Error(`Failed to load projects: ${res.status}`);
        }
        const data = await res.json();
        const found = data.find((p) => (p.id || p._id) === projectId);

        setProject(found || null);

        // Map stored info fields to state (use empty string if missing)
        setClientName(found?.infoClientName ?? "");
        setCompanyName(found?.infoCompanyName ?? "");
        setWebsiteUrl(found?.infoWebsiteUrl ?? "");
        setBrandingGuidelines(found?.infoBrandingGuidelines ?? "");
        setClientLogoUrl(found?.infoClientLogoUrl ?? "");
        setYearsInBusiness(found?.infoYearsInBusiness ?? "");
        setIndustry(found?.infoIndustry ?? "");
        setBusinessType(found?.infoBusinessType ?? "");
        setAboutCompany(found?.infoAboutCompany ?? "");
        setAboutServices(found?.infoAboutServices ?? "");
        setTargetAudience(found?.infoTargetAudience ?? "");
        setServiceLocations(found?.infoServiceLocations ?? "");
        setUsp(found?.infoUsp ?? "");
        setBusinessEmail(found?.infoBusinessEmail ?? "");
        setPhoneNumber(found?.infoPhoneNumber ?? "");
        setAltContact(found?.infoAltContact ?? "");
        setAddress(found?.infoAddress ?? "");
        setStreet(found?.infoStreet ?? "");
        setCity(found?.infoCity ?? "");
        setStateName(found?.infoStateName ?? "");
        setCountry(found?.infoCountry ?? "");
        setPincode(found?.infoPincode ?? "");
        setSpecialNotes(found?.infoSpecialNotes ?? "");

        // If nothing saved yet, open in edit mode; otherwise view mode
        const hasAnyData =
          found?.infoClientName ||
          found?.infoCompanyName ||
          found?.infoWebsiteUrl ||
          found?.infoBrandingGuidelines ||
          found?.infoAboutCompany;
        setIsEditing(!hasAnyData);
        setStep(1);
      } catch (err) {
        setLoadError(err.message || "Error loading project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId) return;
    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");

      const body = {
        infoClientName: clientName.trim(),
        infoCompanyName: companyName.trim(),
        infoWebsiteUrl: websiteUrl.trim(),
        infoBrandingGuidelines: brandingGuidelines.trim(),
        infoClientLogoUrl: clientLogoUrl.trim(),
        infoYearsInBusiness: yearsInBusiness.trim(),
        infoIndustry: industry.trim(),
        infoBusinessType: businessType.trim(),
        infoAboutCompany: aboutCompany.trim(),
        infoAboutServices: aboutServices.trim(),
        infoTargetAudience: targetAudience.trim(),
        infoServiceLocations: serviceLocations.trim(),
        infoUsp: usp.trim(),
        infoBusinessEmail: businessEmail.trim(),
        infoPhoneNumber: phoneNumber.trim(),
        infoAltContact: altContact.trim(),
        infoAddress: address.trim(),
        infoStreet: street.trim(),
        infoCity: city.trim(),
        infoStateName: stateName.trim(),
        infoCountry: country.trim(),
        infoPincode: pincode.trim(),
        infoSpecialNotes: specialNotes.trim(),
      };

      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Failed to update project info: ${res.status}`);
      }

      const updated = await res.json();
      setProject(updated);
      setSaveSuccess("Project info saved successfully.");
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message || "Error saving project info");
    } finally {
      setSaving(false);
    }
  };

  const displayProjectName =
    projectNameFromState || project?.name || "Project Info";

  return (
    <div className="dashboard-root user-dashboard">
      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="Klon" className="topbar-logo" />
        </div>

        <div className="topbar-right">
          <div className="topbar-icon">
            <LuCalendar />
          </div>

          <div className="topbar-icon">
            <FiBell />
          </div>

          <div className="topbar-divider"></div>

          <div className="admin-info">
            <div className="admin-avatar">U</div>
            <div className="admin-text">
              <div className="admin-name">Nextwebi</div>
              <div className="admin-role">User</div>
            </div>
            <div className="topbar-icon">
              <IoIosArrowDown />
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="dashboard-body">
        {/* SIDEBAR */}
        <div className="sidebar">
          <ul className="sidebar-menu">
            <li
              className={`menu-item ${
                location.pathname === "/user/dashboard" ? "active" : ""
              }`}
              onClick={() => navigate("/user/dashboard")}
            >
              <FaHome className="nav-icon" />
              <span>Home</span>
            </li>

            <li
              className={`menu-item ${
                location.pathname === "/user/backlink" ? "active" : ""
              }`}
              onClick={() => navigate("/user/backlink")}
            >
              <FaLink className="nav-icon" />
              <span>Backlinks</span>
            </li>

            <li
              className={`menu-item ${
                location.pathname.startsWith("/user/projects") ? "active" : ""
              }`}
              onClick={() => navigate("/user/projects")}
            >
              <FaDesktop className="nav-icon" />
              <span>View Projects</span>
            </li>

            <li
              className={`menu-item ${
                location.pathname === "/user/categories" ? "active" : ""
              }`}
              onClick={() => navigate("/user/categories")}
            >
              <VscTools className="nav-icon" />
              <span>Tool Collections</span>
            </li>
          </ul>
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/user/dashboard")}
            >
              Home
            </span>
            {" > "}
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/user/projects")}
            >
              View Projects
            </span>
            {" > Info"}
          </div>

          <div className="main-wrapper">
            {/* Title */}
            <h2 className="page-title">
              Project Info – {displayProjectName}
            </h2>

            {/* Messages and loading */}
            {loadError && (
              <div style={{ color: "red", marginBottom: 10 }}>{loadError}</div>
            )}
            {saveError && (
              <div style={{ color: "red", marginBottom: 10 }}>{saveError}</div>
            )}
            {saveSuccess && (
              <div style={{ color: "green", marginBottom: 10 }}>
                {saveSuccess}
              </div>
            )}
            {loading && <div>Loading project...</div>}

            {/* Info card */}
            {!loading && project && (
              <div className="tool-card project-info-card">
                {/* Header inside card: step + View/Edit */}
                <div className="project-info-card-header">
                  {isEditing && (
                    <div className="project-info-card-step">
                      {step === 1
                        ? "Step 1 of 2 – Business & Brand Info"
                        : "Step 2 of 2 – Contact & Address"}
                    </div>
                  )}
                  <button
                    type="button"
                    className="user-project-btn user-project-btn-backlinks"
                    onClick={() => {
                      setIsEditing((prev) => !prev);
                      setStep(1);
                    }}
                  >
                    {isEditing ? "View" : "Edit"}
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                >
                  {/* VIEW MODE: show everything (both steps) */}
                  {!isEditing && (
                    <>
                      {/* Client & Company */}
                      <div className="modal-field-row">
                        <div className="modal-field">
                          <label>Client Name</label>
                          <div>{clientName || "-"}</div>
                        </div>
                        <div className="modal-field">
                          <label>Company Name</label>
                          <div>{companyName || "-"}</div>
                        </div>
                      </div>

                      {/* Website + Years */}
                      <div className="modal-field-row">
                        <div className="modal-field">
                          <label>Website URL</label>
                          <div>{websiteUrl || "-"}</div>
                        </div>
                        <div className="modal-field">
                          <label>Years in Business (optional)</label>
                          <div>{yearsInBusiness || "-"}</div>
                        </div>
                      </div>

                      {/* Industry + Business Type */}
                      <div className="modal-field-row">
                        <div className="modal-field">
                          <label>Industry / Category</label>
                          <div>{industry || "-"} </div>
                        </div>
                        <div className="modal-field">
                          <label>Business Type</label>
                          <div>{businessType || "-"}</div>
                        </div>
                      </div>

                      {/* Branding Guidelines (BOX) */}
                      <div className="modal-field">
                        <label>Branding Guidelines</label>
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {brandingGuidelines || "-"}
                        </div>
                      </div>

                      {/* Client Logo */}
                      <div className="modal-field">
                        <label>Client Logo (Upload optional)</label>
                        <div>{clientLogoUrl || "-"}</div>
                      </div>

                      {/* About Company (BOX) */}
                      <div className="modal-field">
                        <label>
                          About the Company (Short Description – 150–1000
                          words)
                        </label>
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {aboutCompany || "-"}
                        </div>
                      </div>

                      {/* About Services (BOX) */}
                      <div className="modal-field">
                        <label>About Their Services / Products</label>
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {aboutServices || "-"}
                        </div>
                      </div>

                      {/* Target Audience (BOX) */}
                      <div className="modal-field">
                        <label>
                          Target Audience (Who are your customers?)
                        </label>
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {targetAudience || "-"}
                        </div>
                      </div>

                      {/* Service Locations */}
                      <div className="modal-field">
                        <label>Service Locations</label>
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {serviceLocations || "-"}
                        </div>
                      </div>

                      {/* USP */}
                      <div className="modal-field">
                        <label>Unique Selling Points (USP)</label>
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {usp || "-"}
                        </div>
                      </div>

                      {/* Contact details */}
                      <div className="modal-field-row">
                        <div className="modal-field">
                          <label>Business Email</label>
                          <div>{businessEmail || "-"}</div>
                        </div>
                        <div className="modal-field">
                          <label>Phone Number</label>
                          <div>{phoneNumber || "-"}</div>
                        </div>
                      </div>

                      <div className="modal-field">
                        <label>Alternate Contact Number / WhatsApp</label>
                        <div>{altContact || "-"}</div>
                      </div>

                      {/* Address block */}
                      <div className="modal-field">
                        <label>Address</label>
                        <div>{address || "-"}</div>
                      </div>

                      <div className="modal-field-row">
                        <div className="modal-field">
                          <label>Street</label>
                          <div>{street || "-"}</div>
                        </div>
                        <div className="modal-field">
                          <label>City</label>
                          <div>{city || "-"}</div>
                        </div>
                      </div>

                      <div className="modal-field-row">
                        <div className="modal-field">
                          <label>State</label>
                          <div>{stateName || "-"}</div>
                        </div>
                        <div className="modal-field">
                          <label>Country</label>
                          <div>{country || "-"}</div>
                        </div>
                        <div className="modal-field">
                          <label>Pincode</label>
                          <div>{pincode || "-"}</div>
                        </div>
                      </div>

                      {/* Special requirements */}
                      <div className="modal-field">
                        <label>Any Special Requirements / Notes</label>
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {specialNotes || "-"}
                        </div>
                      </div>
                    </>
                  )}

                  {/* EDIT MODE – STEP 1: Business / Brand */}
                  {isEditing && step === 1 && (
                    <>
                      {/* Client & Company */}
                      <div className="modal-field-row">
                        <div className="modal-field">
                          <label>Client Name</label>
                          <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                          />
                        </div>
                        <div className="modal-field">
                          <label>Company Name</label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Website + Years */}
                      <div className="modal-field-row">
                        <div className="modal-field">
                          <label>Website URL</label>
                          <input
                            type="url"
                            placeholder="https://example.com"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                          />
                        </div>
                        <div className="modal-field">
                          <label>Years in Business (optional)</label>
                          <input
                            type="number"
                            min="0"
                            value={yearsInBusiness}
                            onChange={(e) =>
                              setYearsInBusiness(e.target.value)
                            }
                          />
                        </div>
                      </div>

                      {/* Industry + Business Type */}
                      <div className="modal-field-row">
                        <div className="modal-field">
                          <label>Industry / Category</label>
                          <input
                            type="text"
                            placeholder="e.g. IT Services, Healthcare"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                          />
                        </div>
                        <div className="modal-field">
                          <label>Business Type</label>
                          <select
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                          >
                            <option value="">Select Type</option>
                            <option value="Startup">Startup</option>
                            <option value="SME">SME</option>
                            <option value="Enterprise">Enterprise</option>
                          </select>
                        </div>
                      </div>

                      {/* Branding Guidelines (BOX) */}
                      <div className="modal-field">
                        <label>Branding Guidelines</label>
                        <textarea
                          className="boxed-textarea"
                          rows={3}
                          placeholder="Brand colors, fonts, tone of voice, etc."
                          value={brandingGuidelines}
                          onChange={(e) =>
                            setBrandingGuidelines(e.target.value)
                          }
                          style={{ resize: "vertical", width: "100%" }}
                        />
                      </div>

                      {/* Client Logo */}
                      <div className="modal-field">
                        <label>Client Logo (Upload optional)</label>
                        <input
                          type="url"
                          placeholder="Logo URL or file link"
                          value={clientLogoUrl}
                          onChange={(e) => setClientLogoUrl(e.target.value)}
                        />
                      </div>

                      {/* About the Company (BOX) */}
                      <div className="modal-field">
                        <label>
                          About the Company (Short Description – 150–1000
                          words)
                        </label>
                        <textarea
                          className="boxed-textarea"
                          rows={5}
                          placeholder="Short description of the company..."
                          value={aboutCompany}
                          onChange={(e) => setAboutCompany(e.target.value)}
                          style={{ resize: "vertical", width: "100%" }}
                        />
                      </div>

                      {/* About Their Services / Products (BOX) */}
                      <div className="modal-field">
                        <label>About Their Services / Products</label>
                        <textarea
                          className="boxed-textarea"
                          rows={4}
                          placeholder="Key services or products..."
                          value={aboutServices}
                          onChange={(e) => setAboutServices(e.target.value)}
                          style={{ resize: "vertical", width: "100%" }}
                        />
                      </div>

                      {/* Target Audience (BOX) */}
                      <div className="modal-field">
                        <label>
                          Target Audience (Who are your customers?)
                        </label>
                        <textarea
                          className="boxed-textarea"
                          rows={3}
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          style={{ resize: "vertical", width: "100%" }}
                        />
                      </div>

                      {/* Service Locations (line style) */}
                      <div className="modal-field">
                        <label>Service Locations</label>
                        <textarea
                          rows={2}
                          placeholder="Countries / cities served..."
                          value={serviceLocations}
                          onChange={(e) =>
                            setServiceLocations(e.target.value)
                          }
                          style={{ resize: "vertical", width: "100%" }}
                        />
                      </div>

                      {/* USP (line style) */}
                      <div className="modal-field">
                        <label>Unique Selling Points (USP)</label>
                        <textarea
                          rows={3}
                          value={usp}
                          onChange={(e) => setUsp(e.target.value)}
                          style={{ resize: "vertical", width: "100%" }}
                        />
                      </div>
                    </>
                  )}

                  {/* EDIT MODE – STEP 2: Contact & Address */}
                  {isEditing && step === 2 && (
                    <>
                      {/* Contact details */}
                      <div className="modal-field-row">
                        <div className="modal-field">
                          <label>Business Email</label>
                          <input
                            type="email"
                            value={businessEmail}
                            onChange={(e) =>
                              setBusinessEmail(e.target.value)
                            }
                          />
                        </div>
                        <div className="modal-field">
                          <label>Phone Number</label>
                          <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="modal-field">
                        <label>Alternate Contact Number / WhatsApp</label>
                        <input
                          type="text"
                          value={altContact}
                          onChange={(e) => setAltContact(e.target.value)}
                        />
                      </div>

                      {/* Address block */}
                      <div className="modal-field">
                        <label>Address</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>

                      <div className="modal-field-row">
                        <div className="modal-field">
                          <label>Street</label>
                          <input
                            type="text"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                          />
                        </div>
                        <div className="modal-field">
                          <label>City</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="modal-field-row">
                        <div className="modal-field">
                          <label>State</label>
                          <input
                            type="text"
                            value={stateName}
                            onChange={(e) => setStateName(e.target.value)}
                          />
                        </div>
                        <div className="modal-field">
                          <label>Country</label>
                          <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                          />
                        </div>
                        <div className="modal-field">
                          <label>Pincode</label>
                          <input
                            type="text"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Special requirements */}
                      <div className="modal-field">
                        <label>Any Special Requirements / Notes</label>
                        <textarea
                          rows={3}
                          value={specialNotes}
                          onChange={(e) => setSpecialNotes(e.target.value)}
                          style={{ resize: "vertical", width: "100%" }}
                        />
                      </div>
                    </>
                  )}

                  {/* EDIT MODE BUTTONS */}
                  {isEditing && (
                    <div
                      className="modal-actions"
                      style={{
                        justifyContent: "space-between",
                        marginTop: 16,
                      }}
                    >
                      {step === 2 && (
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </button>
                      )}
                      {step === 1 && (
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => setStep(2)}
                        >
                          Next
                        </button>
                      )}
                      {step === 2 && (
                        <button
                          className="primary-btn"
                          type="submit"
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                      )}
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProjectInfoPage;