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

  // Detailed fields
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
  const [isEditing, setIsEditing] = useState(false);

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

        const hasAnyData =
          found?.infoClientName ||
          found?.infoCompanyName ||
          found?.infoWebsiteUrl ||
          found?.infoBrandingGuidelines ||
          found?.infoAboutCompany;
        setIsEditing(!hasAnyData);
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

  const handleLogoFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setClientLogoUrl(reader.result.toString());
      }
    };
    reader.readAsDataURL(file);
  };

  const displayProjectName =
    projectNameFromState || project?.name || "Project Info";

  return (
    <div className="dashboard-root user-dashboard user-project-info-page">
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
            <li
              className={`menu-item ${
                location.pathname === "/user/placements" ? "active" : ""
              }`}
              onClick={() => navigate("/user/placements")}
            >
              <VscTools className="nav-icon" />
              <span>Master of Placement</span>
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
            {/* Title + View/Edit button in one row */}
            <div className="page-header">
              <h2 className="page-title">
                Project Info – {displayProjectName}
              </h2>

              {!loading && project && (
                <button
                  type="button"
                  className="user-project-btn user-project-btn-backlinks"
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  {isEditing ? "View" : "Edit"}
                </button>
              )}
            </div>

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

            {!loading && project && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                {/* SINGLE LONG CARD – all fields */}
                <div className="tool-card project-info-card">
                  {/* Client & Company */}
                  <div className="modal-field-row">
                    <div className="modal-field">
                      <label>Client Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                        />
                      ) : (
                        <div>{clientName || "-"}</div>
                      )}
                    </div>
                    <div className="modal-field">
                      <label>Company Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      ) : (
                        <div>{companyName || "-"}</div>
                      )}
                    </div>
                  </div>

                  {/* Website + Years */}
                  <div className="modal-field-row">
                    <div className="modal-field">
                      <label>Website URL</label>
                      {isEditing ? (
                        <input
                          type="url"
                          placeholder="https://example.com"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                        />
                      ) : (
                        <div>{websiteUrl || "-"}</div>
                      )}
                    </div>
                    <div className="modal-field">
                      <label>Years in Business (Optional)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={yearsInBusiness}
                          onChange={(e) =>
                            setYearsInBusiness(e.target.value)
                          }
                        />
                      ) : (
                        <div>{yearsInBusiness || "-"}</div>
                      )}
                    </div>
                  </div>

                  {/* Industry + Business Type */}
                  <div className="modal-field-row">
                    <div className="modal-field">
                      <label>Industry / Category</label>
                      {isEditing ? (
                        <input
                          type="text"
                          placeholder="e.g. IT Services, Healthcare"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                        />
                      ) : (
                        <div>{industry || "-"}</div>
                      )}
                    </div>
                    <div className="modal-field">
                      <label>Business Type</label>
                      {isEditing ? (
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                        >
                          <option value="">Select Type</option>
                          <option value="Startup">Startup</option>
                          <option value="SME">SME</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                      ) : (
                        <div>{businessType || "-"}</div>
                      )}
                    </div>
                  </div>

                  {/* Branding Guidelines (boxed) */}
                  <div className="modal-field">
                    <label>Branding Guidelines</label>
                    {isEditing ? (
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
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {brandingGuidelines || "-"}
                      </div>
                    )}
                  </div>

                  {/* Client Logo upload + preview */}
                  <div className="modal-field">
                    <label>Client Logo (Upload Image – Optional)</label>
                    {isEditing ? (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                        />
                        {clientLogoUrl && (
                          <div className="logo-preview">
                            <img
                              src={clientLogoUrl}
                              alt="Client logo preview"
                              className="logo-preview-img"
                            />
                          </div>
                        )}
                      </>
                    ) : clientLogoUrl ? (
                      <div className="logo-preview">
                        <img
                          src={clientLogoUrl}
                          alt="Client logo"
                          className="logo-preview-img"
                        />
                      </div>
                    ) : (
                      <div>-</div>
                    )}
                  </div>

                  {/* About the Company */}
                  <div className="modal-field">
                    <label>
                      About the Company 
                    </label>
                    {isEditing ? (
                      <textarea
                        className="boxed-textarea"
                        rows={10}
                        placeholder="Short description of the company..."
                        value={aboutCompany}
                        onChange={(e) => setAboutCompany(e.target.value)}
                        style={{ resize: "vertical", width: "100%" }}
                      />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {aboutCompany || "-"}
                      </div>
                    )}
                  </div>

                  {/* About Services */}
                  <div className="modal-field">
                    <label>About Their Services / Products</label>
                    {isEditing ? (
                      <textarea
                        className="boxed-textarea"
                        rows={6}
                        placeholder="Key services or products..."
                        value={aboutServices}
                        onChange={(e) => setAboutServices(e.target.value)}
                        style={{ resize: "vertical", width: "100%" }}
                      />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {aboutServices || "-"}
                      </div>
                    )}
                  </div>

                  {/* Target Audience */}
                  <div className="modal-field">
                    <label>Target Audience (Who are your customers?)</label>
                    {isEditing ? (
                      <textarea
                        className="boxed-textarea"
                        rows={5}
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        style={{ resize: "vertical", width: "100%" }}
                      />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {targetAudience || "-"}
                      </div>
                    )}
                  </div>

                  {/* Service Locations */}
                  <div className="modal-field">
                    <label>Service Locations</label>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        placeholder="Countries / cities served..."
                        value={serviceLocations}
                        onChange={(e) =>
                          setServiceLocations(e.target.value)
                        }
                        style={{ resize: "vertical", width: "100%" }}
                      />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {serviceLocations || "-"}
                      </div>
                    )}
                  </div>

                  {/* USP */}
                  <div className="modal-field">
                    <label>Unique Selling Points (USP)</label>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={usp}
                        onChange={(e) => setUsp(e.target.value)}
                        style={{ resize: "vertical", width: "100%" }}
                      />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {usp || "-"}
                      </div>
                    )}
                  </div>

                  {/* Contact details */}
                  <div className="modal-field-row">
                    <div className="modal-field">
                      <label>Business Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={businessEmail}
                          onChange={(e) =>
                            setBusinessEmail(e.target.value)
                          }
                        />
                      ) : (
                        <div>{businessEmail || "-"}</div>
                      )}
                    </div>
                    <div className="modal-field">
                      <label>Phone Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      ) : (
                        <div>{phoneNumber || "-"}</div>
                      )}
                    </div>
                  </div>

                  <div className="modal-field">
                    <label>Alternate Contact Number / WhatsApp Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={altContact}
                        onChange={(e) => setAltContact(e.target.value)}
                      />
                    ) : (
                      <div>{altContact || "-"}</div>
                    )}
                  </div>

                  {/* Address block */}
                  <div className="modal-field">
                    <label>Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    ) : (
                      <div>{address || "-"}</div>
                    )}
                  </div>

                  <div className="modal-field-row">
                    <div className="modal-field">
                      <label>Street</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                        />
                      ) : (
                        <div>{street || "-"}</div>
                      )}
                    </div>
                    <div className="modal-field">
                      <label>City</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      ) : (
                        <div>{city || "-"}</div>
                      )}
                    </div>
                  </div>

                  <div className="modal-field-row">
                    <div className="modal-field">
                      <label>State</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                        />
                      ) : (
                        <div>{stateName || "-"}</div>
                      )}
                    </div>
                    <div className="modal-field">
                      <label>Country</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                        />
                      ) : (
                        <div>{country || "-"}</div>
                      )}
                    </div>
                    <div className="modal-field">
                      <label>Pincode</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                        />
                      ) : (
                        <div>{pincode || "-"}</div>
                      )}
                    </div>
                  </div>

                  {/* Special requirements (boxed) */}
                  <div className="modal-field">
                    <label>Any Special Requirements / Notes</label>
                    {isEditing ? (
                      <textarea
                        className="boxed-textarea"
                        rows={8}
                        value={specialNotes}
                        onChange={(e) => setSpecialNotes(e.target.value)}
                        style={{ resize: "vertical", width: "100%" }}
                      />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {specialNotes || "-"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Save button – one for all fields */}
                {isEditing && (
                  <div
                    className="modal-actions"
                    style={{ justifyContent: "flex-end", marginTop: 16 }}
                  >
                    <button
                      className="primary-btn"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save All"}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProjectInfoPage;