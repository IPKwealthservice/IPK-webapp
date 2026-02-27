import { GET_ONBOARDING_PROFILE, UPSERT_ONBOARDING_PROFILE } from "@/graphql/onboardingAgreement.gql";
import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderSteps from "../components/HeaderSteps";

/* ================= TYPES ================= */

type Question = {
  id: number;
  question: string;
  options: string[];
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is your current net worth like?",
    options: [" Below 1 crore", "1–10 crores", "10–25 crores", "25 crores and above"],
  },
  {
    id: 2,
    question: "What is the primary reason you are investing your funds?",
    options: [
      "Long-term capital growth",
      "To meet income needs",
      "Long-term capital growth and income",
      "For capital security",
    ],
  },
  {
    id: 3,
    question: "Which of the following best describes your current stage of life?",
    options: [
      "Making savings for future plans",
      "Saving to buy a home",
      "Saving for retirement",
      "Got immediate money for investing long term",
      "Regular savings investment",
    ],
  },
  {
    id: 4,
    question: "When will you need to start withdrawing funds from this account?",
    options: [" 1 year", "2–5 years", "5–10 years", "More than 10 years from now"],
  },
  {
    id: 5,
    question: "How would you characterize your willingness to accept investment risk in order to achieve your investment objectives?",
    options: ["Low", "Average", "High", "Below Average", "Above Average"],
  },
  {
    id: 6,
    question: "How familiar are you with investment matters?",
    options: [
      "Not familiar",
      "Very familiar when it comes to investments",
      "Somewhat familiar. I don't fully understand investments, including the share market",
      "Fairly familiar. I understand the various factors which influence investment performance",
    ],
  },
  {
    id: 7,
    question: "What is your level of reliance on the income generated from the portfolio to meet your needs?",
    options: [
      "Nil. I have other income sources",
      "Minimal. I have other income sources but the income from the portfolio does help",
      "Reasonable. I rely somewhat on the income generated from the prtfolio",
      "Considerable. I rely heavily on the income generated from the portfolio",
    ],
  },
  {
    id: 8,
    question: "When considering your investments and making investments decisions, do you think about the impact of possible losses or possible gains?",
    options: [
      "I am always concerned about possible losses",
      "I am somewhat concerned about possible losses",
      "I usually consider possible gains",
      "I always consider possible gains",
    ],
  },
  {
    id: 9,
    question: "What is the largest indicative drawdown you could tolerate if a financial crisis struck?",
    options: [
      "Less than 10%",
      "No more than 30%",
      "50% or more",
      "No more than 20%",
      "No more than 40%",
    ],
  },
  {
    id: 10,
    question: "How familiar are you with different types of investments?",
    options: [
      "Liquid Funds FD, PPF",
      "Debt mutual Funds, Bonds",
      "Shares, Equality Oriented Funds",
      "Alternate Assests",
    ],
  },
  {
    id: 11,
    question: "If your investments makes 10% losses next year, will you?",
    options: [
      "Sell your investments and put the proceeds in fixed deposits",
      "Sell some investments and continue to hold the rest",
      "Do nothing",
      "Take advantage of the correction and invest some more money",
    ],
  },
];

const OPTION_SCORES: Record<number, number[]> = {
  1: [2, 3, 4, 5],
  2: [5, 2, 4, 3],
  3: [5, 2, 5, 4, 4],
  4: [1, 3, 4, 5],
  5: [1, 2, 5, 3, 4],
  6: [1, 5, 3, 4],
  7: [5, 3, 4, 4],
  8: [2, 5, 2, 1],
  9: [1, 3, 5, 3, 4],
  10: [1, 4, 3, 5],
  11: [1, 3, 4, 5],
};

export default function RiskType() {
  const navigate = useNavigate();
  const leadId = localStorage.getItem("onboarding_lead_id");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);

  const { data: profileData } = useQuery(GET_ONBOARDING_PROFILE, {
    variables: { leadId },
    skip: !leadId,
  });

  const [upsertOnboarding] = useMutation(UPSERT_ONBOARDING_PROFILE);

  const handleSelect = (qid: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: optionIndex }));
  };

  const isAllAnswered = Object.keys(answers).length === QUESTIONS.length;

  const handleContinue = async () => {
    if (!isAllAnswered) {
      alert("Please answer all questions before proceeding.");
      return;
    }

    let totalScore = 0;
    const qAndA = QUESTIONS.map(q => ({
      questionId: q.id,
      question: q.question,
      answerIndex: answers[q.id],
      answer: q.options[answers[q.id] || 0]
    }));

    QUESTIONS.forEach((q) => {
      const index = answers[q.id];
      if (index !== undefined) {
        totalScore += OPTION_SCORES[q.id][index];
      }
    });

    const percentage = Math.min(100, Math.round((totalScore / 55) * 100));

    let label = "";
    if (percentage <= 33) label = "Conservative";
    else if (percentage <= 66) label = "Moderate";
    else label = "Aggressive";

    if (leadId) {
      setSaving(true);
      try {
        const existingProfile = profileData?.getOnboardingByLeadId || {};
        await upsertOnboarding({
          variables: {
            input: {
              leadId,
              mobile: existingProfile.mobile || "",
              riskScore: percentage,
              riskLabel: label,
              clientQa: JSON.stringify(qAndA)
            }
          }
        });
        navigate("/sales/onboarding/process/suitability");
      } catch (err) {
        console.error("Failed to save risk assessment:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="mobile-padding tablet-padding desktop-padding">
      <div className="flex justify-center mb-6">
        <HeaderSteps current={3} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Risk Questionnaire
        </h2>

        {QUESTIONS.map((q) => (
          <div key={q.id} className="mb-6">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
              {q.id}. {q.question}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt, idx) => {
                const selected = answers[q.id] === idx;

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(q.id, idx)}
                    className={`text-left px-4 py-2.5 rounded-full text-sm border transition-all
                      ${selected
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-indigo-100 text-indigo-900 border-indigo-200 hover:bg-indigo-200"
                      }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex justify-end mt-8">
          <button
            onClick={handleContinue}
            disabled={saving || !isAllAnswered}
            className={`
              px-8 py-2.5 rounded-md bg-indigo-600 text-white font-semibold transition-all
              ${saving || !isAllAnswered ? "bg-gray-300 cursor-not-allowed" : "hover:bg-indigo-700"}
            `}
          >
            {saving ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
