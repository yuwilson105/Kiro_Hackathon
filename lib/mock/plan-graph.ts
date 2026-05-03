import type { PlanStep } from '@/types/plan';

/**
 * Per-step description overrides. Lives at the top so descriptions stay easy
 * to edit without scrolling the whole DAG. Anything missing here falls back
 * to the inline description on the step itself.
 */
const NEW_DESCRIPTIONS: Record<string, string> = {
  'visit-211-resource-center':
    'Dial 211 from any phone or walk into Project Homeless Connect at 123 Main St to get a printed county-specific list of shelters, food pantries, and re-entry case managers. The line is free, confidential, and answers 24/7. Ask the intake worker for a same-day warm handoff to a case manager rather than just a referral sheet.',
  'get-birth-certificate':
    'Order a certified copy from the county clerk-recorder where you were born using form VS 111 (or your state equivalent). It costs around $29 in California, takes 2-4 weeks by mail, or same-day if you go in person with a photo ID. This is the foundation document: SSA, DMV, and most benefit offices will not process you without it.',
  'get-social-security-card':
    'Walk into the SSA field office with form SS-5, your birth certificate, and your CDCR release paperwork (CDC 1515 or equivalent). No appointment needed for replacement cards, but expect a 1-2 hour wait. The card arrives by mail in 10-14 business days; ask the clerk for a printed receipt with your SSN so you can keep moving on benefits and ID.',
  'find-temporary-housing':
    "Call Community Housing Partnership's intake line by 4pm to be placed on tonight's bed list, or go in person before noon for the best shot at a private room. Bring your release paperwork and any TB clearance from CDCR. Most beds are 30-90 day stays and require nightly check-in plus a sobriety agreement.",
  'contact-halfway-house-counselor':
    'Book your intake meeting within 72 hours of arrival: bring your conditions of parole, any prescription list, and your case plan from CDCR. The counsellor signs off on curfew, work passes, and program attendance, so you will see them weekly. Treat this meeting as the gate that opens every other resource the house funds.',
  'reach-out-to-family':
    'Make one phone call or write one letter this week, even if it is short. Lead with your release date, where you are staying, and a working number to reach you back; skip apologies and promises until you have earned a second conversation. The first contact is logistical, not emotional.',
  'attend-aa-na-meeting':
    'Call the SF AA Central Office at (415) 555-0104 for the daily meeting list, or pull it from aasf.org/meetings. Drop-in meetings run morning, noon, and night across the city, no sign-up or fee. Get a sponsor within your first month: that one relationship does more for relapse risk than any other single step.',
  'get-state-id':
    'Book a DMV appointment online (walk-ins routinely wait 4+ hours) and bring your birth certificate, Social Security card, and proof of California address (a halfway-house letter on letterhead works). The fee is $35, waived if you have a CDCR release form dated within the last 90 days. The temporary paper ID is valid the same day; the plastic card arrives in 2-4 weeks.',
  'apply-medicaid':
    'Apply at coveredca.com or BenefitsCal.com, or walk into the Human Services Agency at 170 Otis. Returning citizens at $0 income qualify for full-scope Medi-Cal with no premium and usually get a Benefits Identification Card within 10 days. Coverage is retroactive up to 3 months, so submit before you book any appointments.',
  'enroll-snap-benefits':
    'File at GetCalFresh.org (15-minute application) or at HSA on Otis. Average benefit for a single adult is around $290/month loaded onto an EBT card. Emergency CalFresh hits within 3 days if you are at zero income; the standard determination takes up to 30 days. Drug-felony exclusion was lifted in California in 2015, so a prior conviction does not bar you.',
  'mental-health-intake-appointment':
    "Call Citywide Case Management at (415) 555-0108 to schedule an intake within 7-14 days. Bring your Medi-Cal Benefits Identification Card and a list of any meds you were on inside. The intake is a 60-90 minute assessment that determines whether you're routed to therapy, psychiatry, or intensive case management.",
  'open-bank-account':
    'Walk into Mission SF Federal Credit Union with your state ID, Social Security card, and a piece of mail showing your address. Credit unions skip the ChexSystems screen that locks most people out of big banks, and the opening deposit is $5. You leave the same day with a debit card and routing/account numbers ready for direct deposit.',
  'update-resume':
    'Sit down with a Goodwill SF re-entry counsellor for a 90-minute working session. Prison work assignments (PIA, kitchen, fire camp) count as real experience: the counsellor will translate them into civilian job titles and quantified bullets. Leave with a one-page PDF, a plain-text version for online forms, and a 30-second answer to "tell me about your gap."',
  'attend-job-readiness-workshop':
    'Sign up for the next 2-day workshop at Goodwill SF Career Centre (free, breakfast and lunch included). Day one covers interview practice and your background-disclosure script; day two is direct intros to ban-the-box employers in their hiring pipeline. Bring your résumé, state ID, and a notebook.',
  'get-osha-10-certification':
    'Take the 10-hour course online at OSHAEducationCenter.com or ClickSafety (around $60, free through some workforce programs). You can finish across two evenings; the digital wallet card prints immediately and the physical DOL card arrives in 2 weeks. Required by California law for most construction and warehouse jobs.',
  'apply-first-jobs':
    'Apply to 5 ban-the-box employers this week: Delancey Street, Goodwill, Recology, Whole Foods, and the City of San Francisco all hire returning citizens openly. Use a real phone number, check email daily, and follow up by phone 48 hours after each application. Expect 2-4 weeks from application to first day on the job.',
  'first-job':
    'Read the offer letter twice before signing: confirm the hourly rate, weekly hours, start date, address, and any pre-employment background or drug test. Ask for the offer in writing if you only got it by phone. Tell your parole officer about the offer the same day to avoid any work-pass conflicts.',
  'enroll-in-ged-program':
    'Register at SF Adult Education on Eddy St for free GED prep classes that meet evenings and Saturdays. The full HiSET or GED test runs $35-$135 depending on California fee waivers, which most returning citizens qualify for. Plan on 8-16 weeks of classes before you sit the four exam sections.',
  'reconnect-family':
    "Set a date, a place, and a time limit (start with 60-90 minutes in a neutral spot like a park or diner). Tell them what you want from the visit before it starts: catching up, meeting a kid, or asking about staying for a weekend. Don't bring up money, custody, or old fights at the first sit-down.",
  'build-budget':
    "Book a 1-hour session with a Catholic Charities financial coach (free, no income requirement). Walk in with your last two pay stubs, your halfway-house fees, phone bill, and any restitution or child-support order. You will leave with a one-page budget showing exactly what's left after fixed costs and where the 10% savings transfer comes from.",
  'apply-secured-credit-card':
    'Apply at your credit union first: Mission SF and Self-Help both offer secured Visas with no annual fee and a $200 minimum deposit. Online, the Discover it Secured and Capital One Platinum Secured both report to all three bureaus and graduate to unsecured after 7-12 months of on-time payments. Use it for one small recurring charge (phone bill, gas) and pay it off in full every month.',
  'find-stable-housing':
    'Bring 2 recent pay stubs, your state ID, and a Community Housing Partnership reference letter to apply for SRO units, BMR rentals, or transitional programs like The Geary. Most landlords want income at 2.5x rent and a 1-month deposit; CHP can broker fee waivers and co-sign with re-entry-friendly landlords. Expect 2-6 weeks from application to keys.',
  'open-savings-account':
    'Open a savings account at the same credit union that holds your checking, then set an automatic transfer for the day after each payday: 10% is the goal, $20 is fine to start. Keeping savings at the same institution means transfers are instant and free. Do not order a debit card for this account.',
  'legal-record-expungement-consult':
    'Book a free 1-hour consultation with Bay Area Legal Aid: bring your full RAP sheet (request it from the DOJ with form BCIA 8016RR for $25, fee waiver available). Under PC 1203.4, most non-violent felonies and almost all misdemeanors can be dismissed once probation is complete. The attorney will tell you exactly which counts qualify and file the petition for free.',
  'enroll-in-job-training-program':
    'Pick one sector and apply through OEWD on South Van Ness: tech (Code Tenderloin, 16 weeks), culinary (Old Skool Cafe, 12 weeks), or construction (CityBuild Academy, 18 weeks). All three pay a stipend during training and place graduates directly with hiring partners. Apply at least 4 weeks before the cohort start date.',
  'get-driver-license':
    'Study the California Driver Handbook (free PDF at dmv.ca.gov), book the knowledge test online, and bring your state ID, proof of address, and $41 to the DMV. After passing the written test you get a permit; schedule the behind-the-wheel within 6 months. If you have unpaid traffic tickets or court fines, clear those first or your license will be flagged.',
  'file-taxes':
    "Walk into the VITA site at the Main Library with your W-2s, photo ID, Social Security card, and last year's return if you have it. Free tax prep done by IRS-certified volunteers, federal and state filed the same visit. Single filers earning under $18,591 can claim the federal EITC plus the California EITC, which often totals $500-$1,500 refunded.",
};

/**
 * Static DAG of ~25 life-rebuilding steps for SecondChance.
 * Prerequisites form a real directed acyclic graph - downstream steps will
 * only appear after their upstream prereqs are complete.
 *
 * Resource details are Bay Area / SF / Oakland organisations with
 * believable mock phone numbers in (415) 555-#### format.
 */
const RAW_PLAN_GRAPH: PlanStep[] = [
  // ─── WEEK 1 ────────────────────────────────────────────────────────────────

  {
    id: 'visit-211-resource-center',
    title: 'Visit the 211 resource centre',
    description:
      'Call or walk in to get a printed list of shelters, food banks, and re-entry services near you.',
    category: 'housing',
    urgency: 'urgent',
    estimatedHours: 1,
    prerequisites: [],
    unlocks: ['find-temporary-housing', 'contact-halfway-house-counselor'],
    whyNow:
      'Your first 48 hours are the most critical. This visit maps every resource you need.',
    resourceName: 'Project Homeless Connect',
    resourceAddress: '123 Main St, San Francisco, CA 94105',
    resourcePhone: '(415) 555-0100',
  },

  {
    id: 'get-birth-certificate',
    title: 'Get your birth certificate',
    description:
      'Request a certified copy from the county clerk where you were born. Required for your state ID.',
    category: 'documents',
    urgency: 'urgent',
    estimatedHours: 2,
    prerequisites: [],
    unlocks: ['get-state-id', 'get-social-security-card'],
    whyNow: 'Every other ID document traces back to your birth certificate.',
    resourceName: 'SF City Hall Vital Records',
    resourceAddress: '1 Dr Carlton B Goodlett Pl, San Francisco, CA 94102',
    resourcePhone: '(415) 555-0101',
  },

  {
    id: 'get-social-security-card',
    title: 'Get your Social Security card',
    description:
      'Visit the Social Security Administration office with your birth certificate and release paperwork.',
    category: 'documents',
    urgency: 'urgent',
    estimatedHours: 2,
    prerequisites: ['get-birth-certificate'],
    unlocks: ['get-state-id', 'apply-medicaid', 'enroll-snap-benefits'],
    whyNow: 'Your SSN is required for your state ID application and for most benefits.',
    resourceName: 'Social Security Administration, SF Field Office',
    resourceAddress: '1221 Nevin Ave, Richmond, CA 94801',
    resourcePhone: '(415) 555-0102',
  },

  {
    id: 'find-temporary-housing',
    title: 'Secure temporary housing',
    description:
      "Contact the re-entry shelter referral line to arrange your first night's housing before anything else.",
    category: 'housing',
    urgency: 'urgent',
    estimatedHours: 2,
    prerequisites: ['visit-211-resource-center'],
    unlocks: ['contact-halfway-house-counselor'],
    whyNow: 'Stable housing is the foundation everything else is built on.',
    appliesIfPriority: ['finding-housing'],
    resourceName: 'Community Housing Partnership',
    resourceAddress: '20 Jones St, San Francisco, CA 94102',
    resourcePhone: '(415) 555-0103',
  },

  {
    id: 'contact-halfway-house-counselor',
    title: 'Meet with your halfway house counsellor',
    description:
      'Schedule your intake meeting to review house rules, curfews, and the services available to you.',
    category: 'housing',
    urgency: 'this-week',
    estimatedHours: 1,
    prerequisites: ['visit-211-resource-center'],
    unlocks: ['attend-aa-na-meeting'],
    whyNow:
      'Your counsellor can fast-track referrals and flag resources you might not find on your own.',
  },

  {
    id: 'reach-out-to-family',
    title: 'Reach out to family',
    description:
      'Make a first call or write a letter. Opening that door now makes rebuilding relationships much easier.',
    category: 'family',
    urgency: 'this-week',
    estimatedHours: 1,
    prerequisites: [],
    unlocks: ['reconnect-family'],
    whyNow: 'Early contact sets the tone; waiting longer often makes reconnection harder.',
    isMilestone: true,
    appliesIfPriority: ['reconnecting-family'],
  },

  {
    id: 'attend-aa-na-meeting',
    title: 'Attend an AA / NA meeting',
    description:
      'Find a local meeting through the AA or NA hotline. Drop-in meetings are available every day.',
    category: 'health',
    urgency: 'this-week',
    estimatedHours: 2,
    prerequisites: ['contact-halfway-house-counselor'],
    unlocks: [],
    whyNow: 'Consistent peer support dramatically reduces relapse risk in the first 90 days.',
    resourceName: 'San Francisco AA Central Office',
    resourceAddress: '1765 Market St, San Francisco, CA 94103',
    resourcePhone: '(415) 555-0104',
    appliesIfPriority: ['mental-health', 'staying-out'],
  },

  // ─── WEEK 2 ────────────────────────────────────────────────────────────────

  {
    id: 'get-state-id',
    title: 'Get your state ID',
    description:
      'Visit the DMV with your birth certificate, Social Security card, and proof of address to get a California ID.',
    category: 'documents',
    urgency: 'urgent',
    estimatedHours: 3,
    prerequisites: ['get-birth-certificate', 'get-social-security-card'],
    unlocks: [
      'open-bank-account',
      'apply-medicaid',
      'enroll-snap-benefits',
      'update-resume',
      'apply-first-jobs',
    ],
    whyNow:
      'Your state ID unlocks nearly every next step: banking, benefits, and employment all require it.',
    isMilestone: true,
    resourceName: 'California DMV, San Francisco',
    resourceAddress: '1377 Fell St, San Francisco, CA 94117',
    resourcePhone: '(415) 555-0105',
  },

  {
    id: 'apply-medicaid',
    title: 'Apply for Medi-Cal (Medicaid)',
    description:
      'Submit your Medi-Cal application online or at the county office. Most returning citizens qualify immediately.',
    category: 'health',
    urgency: 'this-week',
    estimatedHours: 2,
    prerequisites: ['get-state-id', 'get-social-security-card'],
    unlocks: ['mental-health-intake-appointment'],
    whyNow: 'Health coverage must be in place before you can book medical or mental-health appointments.',
    resourceName: 'SF Health Service System',
    resourceAddress: '1 South Van Ness Ave, San Francisco, CA 94103',
    resourcePhone: '(415) 555-0106',
  },

  {
    id: 'enroll-snap-benefits',
    title: 'Enroll in SNAP / CalFresh',
    description:
      'Apply at the county social services office or at calfresh.dss.ca.gov to get an EBT food card within 30 days.',
    category: 'finance',
    urgency: 'this-week',
    estimatedHours: 2,
    prerequisites: ['get-state-id', 'get-social-security-card'],
    unlocks: [],
    whyNow: 'Food security reduces stress and keeps you focused on bigger re-entry goals.',
    resourceName: 'SF Human Services Agency',
    resourceAddress: '170 Otis St, San Francisco, CA 94103',
    resourcePhone: '(415) 555-0107',
    excludeIfConviction: ['drug-related'],
  },

  {
    id: 'mental-health-intake-appointment',
    title: 'Complete a mental health intake',
    description:
      'Call the community mental health centre to book your first appointment using your new Medi-Cal card.',
    category: 'health',
    urgency: 'this-week',
    estimatedHours: 2,
    prerequisites: ['apply-medicaid'],
    unlocks: [],
    whyNow: "Getting assessed early ensures you're matched to the right support before a crisis hits.",
    appliesIfPriority: ['mental-health'],
    resourceName: 'Citywide Case Management, DPH',
    resourceAddress: '1380 Howard St, San Francisco, CA 94103',
    resourcePhone: '(415) 555-0108',
  },

  {
    id: 'open-bank-account',
    title: 'Open a bank account',
    description:
      'Visit a felon-friendly bank or credit union with your state ID and Social Security card to open a free checking account.',
    category: 'finance',
    urgency: 'this-week',
    estimatedHours: 2,
    prerequisites: ['get-state-id'],
    unlocks: ['apply-secured-credit-card', 'build-budget'],
    whyNow:
      'You need a bank account to receive a paycheck, make rent payments, and build a financial history.',
    isMilestone: true,
    resourceName: 'Mission SF Federal Credit Union',
    resourceAddress: '3060 16th St, San Francisco, CA 94103',
    resourcePhone: '(415) 555-0109',
    learnCard: {
      title: 'Before you go',
      sections: [
        {
          heading: 'Checking vs savings',
          body: 'A checking account is for daily spending. You get a debit card and can pay bills. A savings account earns interest but limits withdrawals. Start with checking.',
        },
        {
          heading: 'Felon-friendly banks',
          body: 'Many banks screen through ChexSystems. Credit unions and Second Chance banking programmes (offered by some community banks) skip that check. Ask specifically about "second chance checking."',
        },
        {
          heading: 'What to bring',
          body: 'Bring your state ID, Social Security card, and proof of address (a letter from your halfway house or a utility bill works). You may need a small opening deposit ($25–$50).',
        },
      ],
    },
  },

  {
    id: 'update-resume',
    title: 'Update your résumé',
    description:
      'Work with a re-entry employment counsellor to build or refresh your résumé. You can use your prison work history.',
    category: 'employment',
    urgency: 'this-week',
    estimatedHours: 3,
    prerequisites: ['get-state-id'],
    unlocks: ['attend-job-readiness-workshop', 'apply-first-jobs'],
    whyNow: 'A polished résumé is the gating requirement for every job application.',
    appliesIfPriority: ['finding-job'],
    resourceName: 'Goodwill Industries of SF',
    resourceAddress: '1500 Mission St, San Francisco, CA 94103',
    resourcePhone: '(415) 555-0110',
  },

  // ─── WEEK 3 ────────────────────────────────────────────────────────────────

  {
    id: 'attend-job-readiness-workshop',
    title: 'Attend a job readiness workshop',
    description:
      'Join a free 2-day workshop covering interview skills, background-check disclosures, and employer-matching.',
    category: 'employment',
    urgency: 'this-week',
    estimatedHours: 4,
    prerequisites: ['update-resume'],
    unlocks: ['apply-first-jobs'],
    whyNow: 'Practicing your "gap story" before interviews is what separates callbacks from silence.',
    appliesIfPriority: ['finding-job'],
    resourceName: 'Goodwill SF Career Centre',
    resourceAddress: '1500 Mission St, San Francisco, CA 94103',
    resourcePhone: '(415) 555-0110',
  },

  {
    id: 'get-osha-10-certification',
    title: 'Complete OSHA 10 certification',
    description:
      "Take the free online OSHA 10 course. It's the baseline requirement for any construction site job in California.",
    category: 'employment',
    urgency: 'this-month',
    estimatedHours: 10,
    prerequisites: ['update-resume'],
    unlocks: ['apply-first-jobs'],
    whyNow: 'Employers post "OSHA 10 required" on most construction listings. This opens the door.',
    appliesIfPriority: ['finding-job'],
  },

  {
    id: 'apply-first-jobs',
    title: 'Apply to your first 5 jobs',
    description:
      'Target ban-the-box employers and re-entry-friendly companies first; apply to at least 5 positions this week.',
    category: 'employment',
    urgency: 'this-week',
    estimatedHours: 4,
    prerequisites: ['update-resume', 'get-state-id'],
    unlocks: ['first-job'],
    whyNow:
      'The hiring process typically takes 2–4 weeks. Starting applications now keeps that timeline on track.',
    isMilestone: true,
    appliesIfPriority: ['finding-job'],
    resourceName: 'Delancey Street Foundation',
    resourceAddress: '600 Embarcadero, San Francisco, CA 94107',
    resourcePhone: '(415) 555-0111',
  },

  // ─── WEEK 4 ────────────────────────────────────────────────────────────────

  {
    id: 'first-job',
    title: 'Accept your first job offer',
    description:
      'Review your offer letter carefully: confirm pay, hours, start date, and any background-check conditions.',
    category: 'employment',
    urgency: 'this-month',
    estimatedHours: 1,
    prerequisites: ['apply-first-jobs'],
    unlocks: ['find-stable-housing', 'build-budget'],
    whyNow: 'Steady income is the lever that unlocks stable housing and financial planning.',
  },

  {
    id: 'enroll-in-ged-program',
    title: 'Enrol in a GED programme',
    description:
      'Register at the local adult school for GED prep classes. Most programmes are free and offer evening schedules.',
    category: 'education',
    urgency: 'this-month',
    estimatedHours: 3,
    prerequisites: ['get-state-id'],
    unlocks: ['enroll-in-job-training-program'],
    whyNow: 'A GED credential opens a wider job market and is required for most job-training programmes.',
    appliesIfPriority: ['learning-missed', 'finding-job'],
    resourceName: 'SF Adult Education, Civic Center Campus',
    resourceAddress: '750 Eddy St, San Francisco, CA 94109',
    resourcePhone: '(415) 555-0112',
  },

  {
    id: 'reconnect-family',
    title: 'Plan a family reunion visit',
    description:
      'Arrange an in-person visit or video call with family to discuss your plans and ask for support.',
    category: 'family',
    urgency: 'this-month',
    estimatedHours: 2,
    prerequisites: ['reach-out-to-family'],
    unlocks: [],
    whyNow: 'In-person contact rebuilds trust in a way that calls and texts alone cannot.',
    appliesIfPriority: ['reconnecting-family'],
    isMilestone: true,
  },

  // ─── WEEK 5 ────────────────────────────────────────────────────────────────

  {
    id: 'build-budget',
    title: 'Build your first monthly budget',
    description:
      'Sit down with a financial counsellor or use a free app to map out every dollar of income and expense.',
    category: 'finance',
    urgency: 'this-month',
    estimatedHours: 2,
    prerequisites: ['open-bank-account', 'first-job'],
    unlocks: ['open-savings-account', 'apply-secured-credit-card'],
    whyNow:
      'A written budget is the only way to stay out of debt and reach your savings goals on purpose.',
    appliesIfPriority: ['building-finances'],
    resourceName: 'Catholic Charities SF, Financial Coaching',
    resourceAddress: '1660 Bush St, San Francisco, CA 94109',
    resourcePhone: '(415) 555-0113',
    learnCard: {
      title: 'A simple budget',
      sections: [
        {
          heading: 'Income vs expenses',
          body: 'Write down every dollar coming in (wages, benefits) and every dollar going out (rent, food, phone, transport). If expenses exceed income, identify one thing to cut immediately.',
        },
        {
          heading: 'Saving 10 %',
          body: 'Automate a transfer of 10 % of every paycheck to savings the day it arrives. Treat it as a non-negotiable bill. Even $30/paycheck adds up to $780 in a year.',
        },
        {
          heading: 'Tracking weekly',
          body: 'Spend 10 minutes each Sunday reviewing your bank app. Catching overspending early prevents it from snowballing into overdrafts or missed rent.',
        },
      ],
    },
  },

  {
    id: 'apply-secured-credit-card',
    title: 'Apply for a secured credit card',
    description:
      'Deposit $200–$500 to open a secured Visa or Mastercard. Your deposit becomes your credit limit.',
    category: 'finance',
    urgency: 'this-month',
    estimatedHours: 1,
    prerequisites: ['open-bank-account', 'build-budget'],
    unlocks: [],
    whyNow: 'A secured card reports to all three credit bureaus, starting your credit history from zero.',
    appliesIfPriority: ['building-finances'],
    learnCard: {
      title: 'Building credit from zero',
      sections: [
        {
          heading: 'What a credit score is',
          body: 'Your credit score (300–850) tells lenders how reliably you pay debts. It affects apartment applications, car loans, and sometimes job offers. Most returning citizens start with no score at all.',
        },
        {
          heading: 'Why a secured card is the first step',
          body: 'A secured card requires a cash deposit, so the bank takes almost no risk. They report your on-time payments to Experian, Equifax, and TransUnion, building your score month by month.',
        },
        {
          heading: 'Where to apply',
          body: 'Try your local credit union first (often the lowest fees). Online options include the Discover it® Secured card and Capital One Platinum Secured. Avoid cards with monthly fees above $5.',
        },
      ],
    },
  },

  // ─── WEEK 6 ────────────────────────────────────────────────────────────────

  {
    id: 'find-stable-housing',
    title: 'Find stable housing',
    description:
      'Work with a housing counsellor to apply for a rental unit or transitional housing programme with your new pay stubs.',
    category: 'housing',
    urgency: 'this-month',
    estimatedHours: 6,
    prerequisites: ['first-job'],
    unlocks: ['get-driver-license'],
    whyNow:
      'Landlords require proof of income. Your first job makes you eligible for units that were out of reach before.',
    isMilestone: true,
    appliesIfPriority: ['finding-housing'],
    resourceName: 'Community Housing Partnership',
    resourceAddress: '20 Jones St, San Francisco, CA 94102',
    resourcePhone: '(415) 555-0103',
  },

  {
    id: 'open-savings-account',
    title: 'Open a savings account',
    description:
      'Open a free savings account at the same credit union as your checking account and set up automatic transfers.',
    category: 'finance',
    urgency: 'this-month',
    estimatedHours: 1,
    prerequisites: ['build-budget'],
    unlocks: [],
    whyNow: 'Separating your savings from your spending money is what makes the 10 % habit stick.',
    appliesIfPriority: ['building-finances'],
    resourceName: 'Mission SF Federal Credit Union',
    resourceAddress: '3060 16th St, San Francisco, CA 94103',
    resourcePhone: '(415) 555-0109',
  },

  {
    id: 'legal-record-expungement-consult',
    title: 'Book a record expungement consultation',
    description:
      'Meet with a free legal aid attorney to find out which charges are eligible for expungement under California law.',
    category: 'legal',
    urgency: 'this-month',
    estimatedHours: 2,
    prerequisites: ['get-state-id'],
    unlocks: [],
    whyNow:
      "Expunging eligible charges removes employer and housing barriers you'll otherwise carry for years.",
    appliesIfPriority: ['staying-out'],
    resourceName: 'Bay Area Legal Aid',
    resourceAddress: '1269 Howard St, San Francisco, CA 94103',
    resourcePhone: '(415) 555-0114',
  },

  {
    id: 'enroll-in-job-training-program',
    title: 'Enrol in a job training programme',
    description:
      'Sign up for a sector-specific training course (tech, culinary, construction) to qualify for higher-paying roles.',
    category: 'education',
    urgency: 'this-month',
    estimatedHours: 4,
    prerequisites: ['enroll-in-ged-program'],
    unlocks: [],
    whyNow:
      'Sector training can double your starting wage. Getting enrolled now means you complete it by month three.',
    appliesIfPriority: ['finding-job', 'learning-missed'],
    resourceName: 'OEWD Workforce Development, SF',
    resourceAddress: '1 South Van Ness Ave 5th Fl, San Francisco, CA 94103',
    resourcePhone: '(415) 555-0115',
  },

  // ─── WEEK 7 ────────────────────────────────────────────────────────────────

  {
    id: 'get-driver-license',
    title: "Get your driver's licence",
    description:
      'Study for the written test, pass the DMV knowledge test, and schedule your behind-the-wheel exam.',
    category: 'documents',
    urgency: 'this-month',
    estimatedHours: 6,
    prerequisites: ['get-state-id', 'find-stable-housing'],
    unlocks: ['file-taxes'],
    whyNow:
      "A driver's licence expands your job options and makes day-to-day life significantly easier.",
    resourceName: 'California DMV, San Francisco',
    resourceAddress: '1377 Fell St, San Francisco, CA 94117',
    resourcePhone: '(415) 555-0105',
  },

  // ─── WEEK 8 ────────────────────────────────────────────────────────────────

  {
    id: 'file-taxes',
    title: 'File your taxes',
    description:
      'Visit a free VITA tax site to file your federal and state return. You may qualify for the Earned Income Tax Credit.',
    category: 'finance',
    urgency: 'this-month',
    estimatedHours: 2,
    prerequisites: ['get-driver-license'],
    unlocks: [],
    whyNow:
      'The EITC refund can be hundreds or thousands of dollars: money that jumpstarts your savings plan.',
    resourceName: 'IRS VITA Site, SF Public Library',
    resourceAddress: '100 Larkin St, San Francisco, CA 94102',
    resourcePhone: '(415) 555-0116',
  },
];

export const PLAN_GRAPH: PlanStep[] = RAW_PLAN_GRAPH.map((s) => ({
  ...s,
  description: NEW_DESCRIPTIONS[s.id] ?? s.description,
}));
