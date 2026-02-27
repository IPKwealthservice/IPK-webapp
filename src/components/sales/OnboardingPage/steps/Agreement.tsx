import { GET_ONBOARDING_PROFILE, SEND_AGREEMENT_PDF, UPSERT_ONBOARDING_PROFILE } from "@/graphql/onboardingAgreement.gql";
import { useMutation, useQuery } from "@apollo/client";
import { jsPDF } from "jspdf";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderSteps from "../components/HeaderSteps";

const AGREEMENT_TEXT = `
INVESTMENT ADVISORY AGREEMENT

This Investment Advisory Agreement is made on {{DATE}} (date) between IPK WEALTH SERVICES Private Limited, 
which is a SEBI registered Investment Advisor having registered number INA000021386 and having its office 
D.NO 100 B/26, Room No 111, SCS Tower, First Floor, Sankagiri Main Road, Opposite Tiruchengode Court, 
Tiruchengode - 637209, Namakkal, Tamil Nadu hereinafter called the Investment Advisor

AND

{{CLIENT_NAME}}(client name), having its residence at {{ADDRESS}}(address), hereinafter called the Client.

---

CLIENT DETAILS:

PAN Number: {{PAN}}

AADHAR Number: {{AADHAAR}}

DP Id: {{DP_ID}}

Broker Name: {{BROKER}}

Trading Code: {{CLIENT_CODE}}

---

That the expression of the term, Investment Advisor and Client shall mean and include their legal heirs, successors, assigns and representatives, etc.

WHEREAS Investment Advisor is been authorised by SEBI to provide investment advice in terms of SEBI (Investment Advisors) Regulations, 2013.

AND WHEREAS Client wishes to invest in the securities market in accordance with the advice of the Investment Advisor.

NOW, THEREFORE, in consideration of the mutual covenants contained in this agreement, the parties hereby agree as follows:

1. Appointment of the Investment Advisor:
In accordance with the applicable laws, client hereby appoints, entirely at his / her risk, the Investment Advisor to provide the required services (relating to investing in, purchasing, selling or otherwise dealing in securities or investment products, and advice on investment portfolio containing securities or investment products, whether written, oral or through any other means of communication for the benefit of the client and shall include financial planning) in accordance with the terms and conditions of the agreement as mandated under Regulation 19(1)(d) of the Securities and Exchange Board of India (Investment Advisors) Regulations, 2013 and SEBI (Investment Advisors) (amendment) Regulations, 2020.

2. Consent: 
The Client hereby provides consent to the following that he/she had read and understood the terms and conditions of Investment Advisory services provided by the Investment Advisor along with the fee structure and mechanism for charging and payment of fee and based on client’s request to the Investment Advisor, an opportunity was provided by the Investment Advisor to ask questions and interact with ‘person(s) associated with the investment advice’.

3. Declaration from Investment Advisor:
The Investment Advisor hereby declares that it
• shall neither render any investment advice nor charge any fee until the client has signed this agreement.
• shall not manage funds and securities on behalf of the client and that it shall only receive such sums of monies from the client as are necessary to discharge the client’s liability towards fees owed to the Investment Advisor.
• shall not, in the course of performing its services to the client, hold out any investment advice implying any assured returns or minimum returns or target return or percentage accuracy or service provision till achievement of target returns or any other nomenclature that gives the impression to the client that the investment advice is risk-free and/or not susceptible to market risks and or that it can generate returns with any level of assurance.

4. Fees specified under Investment Advisor Regulations and relevant circulars issued thereunder:
As per the Regulation 15A of the SEBI Investment Advisor Regulations, an Investment Advisor can charge fees from the clients in Assets under Advice (AUA) mode.
• The maximum fees that may be charged under this mode shall not exceed 2.5 percent of AUA per annum per client across all services offered by IA.
• IA shall be required to demonstrate AUA with supporting documents like demat statements, unit statements etc. of the client.
• Any portion of AUA held by the client under any pre-existing distribution arrangement with any entity shall be deducted from AUA for the purpose of charging fee by the IA.

5. Risk Factors, Risk Profiling and Assessment:
• The Investor agrees to follow all procedures as required by the Investment Advisor for conducting risk assessments and profiling the Client as required under Applicable Laws.
• The Investor shall provide the Investment Advisor with all documents and information as required under Applicable Laws.
• The Investment Advisor shall include a detailed statement of risks associated with each type of investment in Securities and investment products.

6. Scope of Services:
Investment Advisor shall provide the services as mentioned below:
• Assist in articulating client objectives and values.
• Investment recommendations on the fee-based model.
• The subject matter of recommendations will be related to the equity market or commodity market.

7. Functions of the Investment Advisor: 
Functions, obligations, duties and responsibilities of the Investment Advisor (including principal officer and all persons associated with the investment advice), as envisaged in the Regulations with specific provisions covering, inter alia:
(a) Terms of compliance with the Securities and Exchange Board of India (Investment Advisors) Regulations, 2013 and its amendments, rules, circulars and notifications.
(b) Risk assessment procedure of client including their risk capacity and risk aversion.
(c) Providing reports to clients on potential and current investments.
(d) Maintenance of records i.e., client-wise KYC, risk assessment, analysis reports of investment advice and suitability, terms and conditions document, related books of accounts and a register containing list of clients along with dated investment advice and its rationale in compliance with the Securities and Exchange Board of India (Investment Advisors) Regulations, 2013.
(e) Provisions regarding audit as per the Securities and Exchange Board of India (Investment Advisors) Regulations, 2013 and SEBI (Investment Advisors) (amendment) Regulations, 2020.

Investment Advisor will have authority to execute any trade or withdraw or transfer assets from client’s account on Prior Approval from client.
Investment Advisor is responsible only for the investment advices for the assets (financial assets) over which client has provided Investment Advisor discretionary authority and not for the diversification or prudent investment of any other assets of Client.

8. Investment Objectives and Guidelines:
Investment Advisor would provide investment advices in Equity/Commodity segment through direct schemes/direct codes. Client assures that there are no specifications / restrictions on any investments.

Further based on Risk Category and considering Age, Income, Client’s Desire to Invest in Equity market, Investment Goal, Disposable income, Surplus fund and other factors of client as informed by client, Investment Advisor has advised and client has also agreed to take Advisory service for a duration of month(s).

9. Period of Agreement & Termination:
Subject to the terms of this clause 9, this Agreement shall be valid, binding and in force from the date of execution of this Agreement until terminated as per the terms of this Agreement.
• Either of the Parties may at any time terminate this agreement by giving not less than 30 (thirty) days’ written notice of termination to the other Party, and the Agreement shall stand terminated on the date specified in such notice as the date of termination.
• Either Party shall have a right to terminate this Agreement after due giving due intimation to the other Party through a written notice, if at any time during the term of this Agreement, the other Party is in violation of any Applicable Laws or becomes insolvent or is subject to liquidation and/or bankruptcy proceedings.
• Either Party may terminate this Agreement with immediate effect, if the other Party has committed a breach of any provisions of the Agreement which is deemed to be incurable.
• The Investor may terminate this Agreement in case of suspension of the certificate of registration of the Investment Advisor by way of written notice.
• The Investment Advisor shall be entitled to terminate this Agreement with immediate effect if the event the Client fails and/or neglects to pay any fees, charges or other amounts payable (if any) under this Agreement;
• This Agreement may be terminated forthwith by the Investment Advisor, at its sole discretion and without being further liable or responsible in any manner whatever, on and from the date of know knowledge / receipt of sufficient evidential documents of the occurrence of any of the following events during the term of this Agreement:
• Misrepresentation by the Client at the time of account opening or otherwise.
• If the Client is barred and/or restricted and/ or suspended from accessing the securities / financial markets by any regulatory/ administrative/ legislative authority at any time and in any manner whatsoever.
• Breach of terms of the Agreement by the Client or any fraud committed by the Client in respect of transactions or in transactions in securities in general at any time and in any manner whatsoever.
• Any proceedings or investigations (regulatory or otherwise) that involve the Client or his/ her/its properties have been initiated or is ongoing.
• This Agreement cannot be performed in its entirety due to any change in the laws in force in India;

10. Amendments:
This agreement may be amended by mutual written consent of the parties and shall have same impact as of this Agreement.

11. Representation to the Client:
The investment advisor shall take all consents and permissions from the client prior to undertaking any actions in relation to the securities or investment product advised by the investment advisor.

Client is responsible for the accuracy and completeness of all information provided to Investment Advisor and agrees that Investment Advisor is not responsible for any losses, costs, damages or claims caused by Client’s failure to provide such information to Investment Advisor.

Client acknowledges and agrees that Investment Advisor is in no way responsible for the performance of securities that Client purchases on Client’s own.

12. Fees:
• The client will be charged with 2.5% of Asset Under servicing (AUS) Every Financial Year
• Investment Advisor will not take any Commission from Broker or From Any other Intermediary. Investment Advisor will not take any share From Profits. Fees will be charged for the total Assets under our service
• All The fees charged will be prepaid in nature. Investor Can opt for Yearly or Half Yearly Fee structure Based on His Convenience.
• Fees Paid are Non-Refundable
• Investor need to initiate the payment within 15 days of the Bill Generation, if not paid within the time investment advisor has the rights to sell the stocks for the particular (fees) amount.
• All fees will be charges with GST or any other Taxation Government may impose time to time.
• Percentage of the Fees may also Differ according to the Regulations imposed by the regulator Time to Time

13. Representations and covenants:
Investment Advisor undertakes to comply with the Securities and Exchange Board of India (Investment Advisors) Regulations, 2013 and its amendments, rules, circulars and notifications and keep the SEBI registration valid throughout the term of the Agreement and shall also ensure that Investment Advisor, principal officer, persons associated with the investment advice are qualified and certified all times as per the Regulations.

14. Death or Disability of client:
In event of client’s death / disability, services shall be terminated or provided to his/her succession, nomination, representation etc.

15. Adherence to grievance redressal timelines:
Investment Advisor shall be responsible to resolve the grievances within the timelines specified under SEBI circulars. In case of any query or grievance, client shall contact through following medium:
Tel No.: +91 9688105880
Mail id: vijipriya@ipkwealth.com

16. Indemnity: 
Client acknowledges that the Investment Advisor’s, investment recommendations involve degree of risk. Client acknowledges that all investment activity in Client’s Account shall be at his/her own risk, which can result in loss of Client's investment capital, annual income, and/or tax benefits.
Client acknowledges that the Investment Advisor will not reimburse Client for any losses.
Client acknowledges that the Investment Advisor's past performance of recommended investments should not be construed as an indication of future results, which may prove to be better or worse than the past.
Client acknowledges that the Investment Advisor does not claim to be able to accurately predict the short-term or long-term future investment performance of any individual security or of a group of securities.
Client acknowledges that the Investment Advisor makes judgmental evaluations before providing investment advice for Client. In making judgmental evaluations, the Investment Advisor agrees to use its best efforts to review sources of information that it has found to be valuable, accurate and reliable.
Client acknowledges that the Investment Advisor cannot and does not survey all sources of publicly available information.
Client acknowledges that the Investment Advisor is not responsible for the accuracy or completeness of information furnished to the Investment Advisor by Client or by any other party.

Investment Discretion:
• Investment Advisory portfolio services will be discretionary in Nature. All the decision regarding to the investment will be made by advisor
• And Investor Cannot provide suggestion or Recommendations to the Investment Advisor
• All Decision regarding to investment will be taken by Investment Advisor on his sole Discretion

Disclosures:
Client shall read the disclosure as mentioned on website and Investment Advisor shall disclose to the client, if there is any change in the information contained therein.

Disclaimer:
Client shall read and understood the disclaimer as mentioned on website.

IN WITNESS WHEREOF, the parties hereto have executed the Agreement on the date(s) set forth below, and the Agreement is effective on the date of acceptance by the Advisor.

Power of attorney:
I {{CLIENT_NAME}} (Client Name) have authorised my Investment Advisor IPK WEALTH SERVICES PRIVATE LIMITED to execute the trade i.e. is to provide Implementation services to my Demat Services.
I {{CLIENT_NAME}} (Client name) here by authorise the Investment advisor has the rights to rebalance and restructure the portfolio based on the Market Conditions without my authorization. And I Accept to take all risks in investing.

Investment Advisor Has the authorisation only to Buy / Sell and maintain the stocks. Doesn't have any other authorisation like with withdrawal etc
`;

export default function Agreement() {
  const navigate = useNavigate();
  const leadId = localStorage.getItem("onboarding_lead_id") || "";

  const { data, loading } = useQuery(GET_ONBOARDING_PROFILE, {
    variables: { leadId },
    skip: !leadId,
    fetchPolicy: "network-only",
  });

  console.log("Agreement Lead ID:", leadId);
  console.log("Agreement Data:", data);
  console.log("Agreement Loading:", loading);

  const [upsertOnboarding] = useMutation(UPSERT_ONBOARDING_PROFILE);
  const [sendAgreementPdf] = useMutation(SEND_AGREEMENT_PDF);

  const profile = data?.getOnboardingByLeadId;

  const [agreed, setAgreed] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const agreementRef = useRef<HTMLDivElement | null>(null);

  // Signature State
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState<string | null>(null);

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSignatureError(null);

    if (!file) return;

    // Validate format
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setSignatureError("Invalid file format. Please upload JPG, JPEG, or PNG.");
      return;
    }

    // Validate size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      setSignatureError("File size exceeds 2MB limit.");
      return;
    }

    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
  };

  const handleRemoveSignature = () => {
    setSignatureFile(null);
    setSignaturePreview(null);
    setSignatureError(null);
  };

  const agreementData = useMemo(() => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return {
      date: dateStr,
      client: {
        name: [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "N/A",
        pan: profile?.pan || "N/A",
        aadhaar: profile?.aadhaar || "N/A",
        mobile: profile?.mobile || "N/A",
        email: profile?.email || "N/A",
        address: profile?.permAddress || profile?.commAddress || "N/A",
        location: profile?.location || "N/A",
      },
      account: {
        broker: profile?.brokerName || "IPK Wealth",
        clientCode: profile?.clientCode || "PENDING",
        dpId: profile?.dpId || "PENDING",
        scheme: profile?.schemeName || "N/A",
      },
      nominee: {
        name: profile?.nomineeName || "N/A",
        relationship: profile?.nomineeRelationship || "N/A",
        contact: profile?.nomineeContact || "N/A",
      },
      billing: {
        name: profile?.billName || [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "N/A",
      }
    };
  }, [profile]);

  const handleScroll = () => {
    const el = agreementRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
    if (isAtBottom) {
      setHasScrolledToEnd(true);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const doc = new jsPDF();
      
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (2 * margin);
      
      doc.setFontSize(16);
      doc.text("INVESTMENT ADVISORY AGREEMENT", pageWidth / 2, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      // Use the same mapping logic as the web view
      let text = AGREEMENT_TEXT;
      const replacements: Record<string, string> = {
        "{{DATE}}": agreementData.date,
        "{{CLIENT_NAME}}": agreementData.client.name,
        "{{PAN}}": agreementData.client.pan,
        "{{AADHAAR}}": agreementData.client.aadhaar,
        "{{ADDRESS}}": agreementData.client.address,
        "{{LOCATION}}": agreementData.client.location,
        "{{BROKER}}": agreementData.account.broker,
        "{{CLIENT_CODE}}": agreementData.account.clientCode,
        "{{DP_ID}}": agreementData.account.dpId,
        "{{NOMINEE_NAME}}": agreementData.nominee.name,
        "{{NOMINEE_RELATION}}": agreementData.nominee.relationship,
        "{{NOMINEE_CONTACT}}": agreementData.nominee.contact,
        "{{ADMIN_PHONE}}": "73730 41590",
        "{{ADMIN_EMAIL}}": "ipkwealth@gmail.com",
      };

      Object.entries(replacements).forEach(([key, val]) => {
        text = text.split(key).join(val);
      });

      const lines = doc.splitTextToSize(text, contentWidth);
      
      let y = 40;
      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 6;
      });

      // Add space for signatures
      if (y > 220) {
        doc.addPage();
        y = 30;
      } else {
        y += 20;
      }

      // 1. Company Seal & Signature
      try {
        const companySealUrl = "/images/company-seal.png";
        doc.addImage(companySealUrl, 'PNG', margin, y, 50, 25);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Managing Director,", margin, y + 32);
        doc.text("IPK Wealth Services Private Limited", margin, y + 37);
      } catch (err) {
        console.warn("Could not add company seal to PDF", err);
      }

      // 2. Client Signature
      if (signaturePreview) {
        try {
          doc.addImage(signaturePreview, 'PNG', pageWidth - margin - 50, y, 50, 25);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text("Client Signature", pageWidth - margin - 25, y + 32, { align: "center" });
        } catch (err) {
          console.warn("Could not add client signature to PDF", err);
        }
      }

      // Save locally (This should work regardless of backend status)
      doc.save(`Agreement_${agreementData.client.name.replace(/\s+/g, '_')}.pdf`);

      // 3. Try to send to backend for Email/WhatsApp
      if (leadId) {
        try {
          const pdfBase64 = doc.output('datauristring');
          await sendAgreementPdf({
            variables: {
              input: {
                leadId,
                pdfBase64
              }
            }
          });
          alert("Agreement downloaded and sent to your registered Email and WhatsApp.");
        } catch (sendErr) {
          console.error("Failed to send agreement via Email/WhatsApp", sendErr);
          alert("Agreement downloaded successfully, but we encountered an error sending the copy to your Email/WhatsApp. Please save the downloaded file.");
        }
      } else {
        alert("Agreement downloaded successfully. (Note: Automatic email/WhatsApp delivery skipped as no Lead ID was found)");
      }
    } catch (e) {
      console.error("PDF Generation failed", e);
      alert("Failed to generate the PDF agreement. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNext = async () => {
    try {
      await upsertOnboarding({
        variables: {
          input: {
            leadId,
            agreementAccepted: true,
            agreementAt: new Date(),
          }
        }
      });
      navigate("/sales/onboarding/process/e-sign");
    } catch (e) {
      console.error("Failed to save agreement", e);
    }
  };

  const formattedContent = useMemo(() => {
    let text = AGREEMENT_TEXT;
    const replacements: Record<string, string> = {
      "{{DATE}}": agreementData.date,
      "{{CLIENT_NAME}}": agreementData.client.name,
      "{{PAN}}": agreementData.client.pan,
      "{{AADHAAR}}": agreementData.client.aadhaar,
      "{{ADDRESS}}": agreementData.client.address,
      "{{LOCATION}}": agreementData.client.location,
      "{{BROKER}}": agreementData.account.broker,
      "{{CLIENT_CODE}}": agreementData.account.clientCode,
      "{{DP_ID}}": agreementData.account.dpId,
      "{{NOMINEE_NAME}}": agreementData.nominee.name,
      "{{NOMINEE_RELATION}}": agreementData.nominee.relationship,
      "{{NOMINEE_CONTACT}}": agreementData.nominee.contact,
      "{{ADMIN_PHONE}}": "73730 41590",
      "{{ADMIN_EMAIL}}": "ipkwealth@gmail.com",
    };

    Object.entries(replacements).forEach(([key, val]) => {
      text = text.split(key).join(val);
    });

    return text.split("\n\n").map((para, i) => {
      if (para.trim() === "---") return <hr key={i} className="my-8 border-gray-200" />;

      const isHeader = i === 0 || para.toUpperCase() === para && para.length < 50;
      const isListItem = para.trim().startsWith("•") || /^[0-9]+\./.test(para.trim()) || para.trim().startsWith("(a)");

      return (
        <p
          key={i}
          className={`
            mb-4 text-justify leading-relaxed text-gray-800
            ${isHeader ? "text-lg font-bold text-center uppercase mb-6 tracking-wide" : "text-sm"}
            ${isListItem ? "pl-4" : ""}
          `}
        >
          {para}
        </p>
      );
    });
  }, [agreementData]);

  const canProceed = agreed && hasScrolledToEnd && !!signatureFile && !signatureError;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading professional agreement...</p>
      </div>
    );
  }

  return (
    <div className="mobile-padding tablet-padding desktop-padding pb-12 bg-gray-50 min-h-screen">
      <div className="flex justify-center mb-10 pt-8">
        <HeaderSteps current={5} />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-gray-900 to-indigo-900 px-8 py-6 text-white flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Investment Advisory Agreement</h1>
              <p className="text-indigo-200 text-xs mt-1">Please review the terms of service below</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <img
                  src="/ipk-logo.jpg"
                  alt="IPK Wealth Logo"
                  className="h-12 w-auto object-contain bg-white px-3 py-1 rounded"
                />
              </div>
            </div>
          </div>

          {/* Document Body */}
          <div className="relative">
            <div
              ref={agreementRef}
              onScroll={handleScroll}
              className="h-[800px] overflow-y-auto px-12 sm:px-24 py-20 bg-white"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="max-w-3xl mx-auto font-serif">
                {formattedContent}

                {/* Signatures Section */}
                <div className="mt-12 flex flex-col sm:flex-row justify-between items-end gap-10">

                  {/* Company Signature */}
                  <div className="flex flex-col items-center pb-2">
                    <div className="w-48 h-24 flex items-center justify-center mb-2">
                      <img
                        src="/images/company-seal.png"
                        alt="Company Seal"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.className = "w-48 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg mb-2";
                            parent.innerHTML = '<span class="text-xs text-gray-400 font-bold">Company Seal</span>';
                          }
                        }}
                      />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 text-center">
                      Managing Director,<br />
                      IPK Wealth Services Private Limited
                    </h3>
                  </div>

                  {/* Client Signature Section */}
                  <div className="w-full max-w-sm">
                    <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-center transition-colors hover:bg-gray-100">
                      {signaturePreview ? (
                        <div className="relative group">
                          <img
                            src={signaturePreview}
                            alt="Client Signature"
                            className="max-h-20 object-contain border border-gray-200 rounded-md bg-white p-1 shadow-sm"
                          />
                          <button
                            onClick={handleRemoveSignature}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Remove Signature"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          <p className="text-[10px] text-green-600 font-semibold mt-1 flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            Signature Uploaded Successfully
                          </p>
                        </div>
                      ) : (
                        <div className="w-full">
                          <label htmlFor="signature-upload" className="cursor-pointer flex flex-col items-center gap-1">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 text-indigo-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            </div>
                            <span className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Click to upload signature</span>
                            <span className="text-[10px] text-gray-500">JPG, JPEG, PNG (Max 2MB)</span>
                          </label>
                          <input
                            id="signature-upload"
                            type="file"
                            accept="image/jpeg, image/jpg, image/png"
                            className="hidden"
                            onChange={handleSignatureChange}
                          />
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-2 text-center">Client Signature</h3>
                    {signatureError && (
                      <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {signatureError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll Indicator Overlay */}
            {!hasScrolledToEnd && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <div className="bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-bold shadow-2xl animate-bounce flex items-center gap-2">
                  <span>Scroll down to end to agree</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 border-t border-gray-200 p-8 sm:px-12">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">


              {/* Acceptance Checkbox */}
              <div className="flex items-start gap-4 transition-all duration-300">
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    disabled={!hasScrolledToEnd}
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>
                <label
                  className={`text-xs leading-relaxed select-none cursor-pointer font-medium ${hasScrolledToEnd ? "text-gray-800" : "text-gray-400"}`}
                  onClick={() => hasScrolledToEnd && setAgreed(!agreed)}
                >
                  I hereby confirm that I have read and understood the entire **Investment Advisory Agreement**,
                  including the risk disclosures and fee structures. I authorize **IPK Wealth Services** to provide
                  discretionary advisory services as per the terms mentioned above.
                </label>
              </div>



              {/* Final Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  disabled={isDownloading}
                  onClick={handleDownload}
                  className={`
                    px-8 py-2.5 rounded-lg border-2 border-indigo-600 text-indigo-600 font-bold text-sm uppercase tracking-wider
                    transition-all duration-300 hover:bg-indigo-50 active:scale-95
                    ${isDownloading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {isDownloading ? "Processing..." : "Download"}
                </button>

                <button
                  disabled={!canProceed}
                  onClick={handleNext}
                  className={`
                      px-8 py-2.5 rounded-lg text-white font-bold text-sm uppercase tracking-wider
                      transition-all duration-300
                      ${canProceed
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95"
                      : "bg-gray-300 cursor-not-allowed opacity-60"}
                    `}
                >
                  Authorize & Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
