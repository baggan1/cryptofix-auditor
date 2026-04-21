const fs = require('fs');
const path = require('path');

function fixTier5(dir) {
  const scoredPath = path.join(dir, 'scored_report.json');
  const extractionPath = path.join(dir, 'extraction_result.json');

  if (!fs.existsSync(scoredPath)) return;

  const scored = JSON.parse(fs.readFileSync(scoredPath, 'utf8'));
  const extraction = fs.existsSync(extractionPath) ? JSON.parse(fs.readFileSync(extractionPath, 'utf8')) : null;

  const fixes = {
    "T5_001": {
      status: "no_credit",
      evidence: dir.includes('derivatives') 
        ? "SecurityIDSource=Y (DTI) not documented in Coinbase Derivatives spec"
        : "SecurityIDSource=Y (DTI) not explicitly documented in Coinbase Exchange spec."
    },
    "T5_002": {
      status: "no_credit",
      evidence: dir.includes('derivatives')
        ? "Tags 2897/2899 CurrencyCodeSource not documented"
        : "Tags 2897/2899 (CurrencyCodeSource) not explicitly documented."
    },
    "T5_003": {
      status: "no_credit",
      evidence: dir.includes('derivatives')
        ? "SecurityType=DIGITAL not documented; spec uses SecurityType for product classification (FUT/OPT) not ISO 24165 DIGITAL value"
        : "Tag 167 found in spec but only with FUT/SPOT values. SecurityType=DIGITAL (ISO 24165) not documented."
    },
    "T5_004": {
      status: "no_credit",
      evidence: dir.includes('derivatives')
        ? "PartySubIDType tag 803 wallet value not documented"
        : "PartySubIDType (803) wallet value not documented."
    },
    "T5_005": {
      status: "no_credit",
      evidence: dir.includes('derivatives')
        ? "SecAltIDGrp DTI pair pattern not documented; tag 55 Symbol present in NOS but without DAWG DTI identification pattern"
        : "Tag 55 Symbol present in NOS but SecAltIDGrp not used for DTI pair identification. DAWG pattern not documented."
    }
  };

  // Fix full_detail
  scored.full_detail.forEach(check => {
    if (fixes[check.check_id]) {
      check.status = fixes[check.check_id].status;
      check.evidence = fixes[check.check_id].evidence;
      check.points_earned = 0;
    }
  });

  // Fix gap_summary
  Object.keys(fixes).forEach(id => {
    const existingGap = scored.gap_summary.find(g => g.check_id === id);
    if (!existingGap) {
      const check = scored.full_detail.find(c => c.check_id === id);
      scored.gap_summary.push({
        check_id: id,
        fix_tag: check.fix_tag || "",
        field_name: check.field_name || "",
        message_type: check.message_type || "35=D",
        tier: 5,
        status: "no_credit",
        points_lost: 0,
        evidence: fixes[id].evidence
      });
    } else {
      existingGap.status = "no_credit";
      existingGap.evidence = fixes[id].evidence;
      existingGap.points_lost = 0;
    }
  });

  // Update extraction_result if it exists
  if (extraction) {
    extraction.checks.forEach(check => {
      if (fixes[check.check_id]) {
        check.status = fixes[check.check_id].status;
        check.evidence = fixes[check.check_id].evidence;
      }
    });
    fs.writeFileSync(extractionPath, JSON.stringify(extraction, null, 2));
  }

  fs.writeFileSync(scoredPath, JSON.stringify(scored, null, 2));
  console.log(`Fixed Tier 5 in ${dir}`);
}

fixTier5('audits/coinbase-exchange');
fixTier5('audits/coinbase-derivatives');
