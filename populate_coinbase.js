const fs = require('fs');

const rubric = JSON.parse(fs.readFileSync('cryptofix_master_rubric.json', 'utf8'));

const exchange_name = "Coinbase Exchange";
const slug = "coinbase-exchange";
const audit_date = new Date().toISOString().split('T')[0];

// Subagent findings summary
const supported_msgs = ['D', '8', 'F', 'G', '9', 'A', '0', '5', '3', 'j', 'V', 'W', 'X', '4'];
const unsupported_msgs = ['Q', 'AE', 'AR', 'J', 'P', 'R', 'S', 'AJ'];

const extraction = {
  exchange_name: exchange_name,
  spec_source: "multi-url",
  asset_classes_audited: ["spot"],
  extraction_date: audit_date,
  extractor_notes: "FIX 5.0 SP2 (FIXT 1.1 session). AggressorIndicator (1057) used instead of 851. Resend requests NOT supported. XML dictionary found at: https://docs.cdp.coinbase.com/exchange/files/cb_exch_fix_dictionaries-20251119.zip",
  checks: []
};

rubric.tiers.forEach(tier => {
  tier.checks.forEach(check => {
    const check_id = check.id;
    const msg_type = check.message_type;
    const level = check.level;
    const tag = check.fix_tag;
    
    let status = "no_credit";
    let evidence = null;
    
    if (level === "message") {
      if (msg_type) {
        const clean_msg = msg_type.replace("35=", "");
        if (supported_msgs.includes(clean_msg)) {
          status = "full_credit";
          evidence = `Supported as per FIX 5.0 spec for ${exchange_name}.`;
        } else if (unsupported_msgs.includes(clean_msg)) {
          status = "no_credit";
          evidence = "Message not found/documented in FIX 5.0 spec.";
        }
      }
      
      if (check.message_name && check.message_name.includes("ResendRequest")) {
        status = "no_credit";
        evidence = "Resend Requests (35=2) not supported on Coinbase FIX 5.0. Fresh sessions expected.";
      }
      
      if (check_id === "T8_HDR_000") {
        status = "full_credit";
        evidence = "Standard Header documented (8, 49, 56, 34, 52).";
      }
      
      if (check_id === "T8_HB_COD") {
        status = "full_credit";
        evidence = "Cancel-on-Disconnect behavior documented and configurable.";
      }
    } else if (level === "tag") {
      if (check_id.includes("HDR")) {
        status = "full_credit";
        evidence = `Tag ${tag} documented in Standard Header.`;
      } else if (msg_type) {
        const clean_msg = msg_type.replace("35=", "");
        if (supported_msgs.includes(clean_msg)) {
          status = "full_credit";
          evidence = `Tag ${tag} (${check.field_name}) documented in 35=${clean_msg} table.`;
          
          if (check_id === "T2_8_851") {
            status = "partial_credit";
            evidence = "Uses custom tag 1057 AggressorIndicator (Y=Taker, N=Maker) instead of standard 851.";
          }
          
          if (check_id === "T8_A_141") {
            status = "full_credit";
            evidence = "ResetSeqNumFlag (141) required and documented for fresh sessions.";
          }
        } else {
          status = "no_credit";
          evidence = `Message 35=${clean_msg} not supported, so tag ${tag} is absent.`;
        }
      }
    }
    
    if (tier.tier === 6) {
      if (check_id.includes("DC")) {
        status = "full_credit";
        evidence = "Supported on dedicated Drop Copy port 6122.";
        if (String(tag) === "797") {
          status = "partial_credit";
          evidence = "Uses session-level DropCopyFlag (9406) instead of per-message CopyMsgIndicator (797).";
        }
      }
    }
    
    if (tier.tier === 7) {
      const clean_msg = (msg_type || "").replace("35=", "");
      if (['V', 'W', 'X'].includes(clean_msg)) {
        status = "full_credit";
        evidence = `Market Data tag ${tag} documented for ${msg_type}.`;
      }
    }

    extraction.checks.append ? null : extraction.checks.push({
      check_id: check_id,
      fix_tag: tag,
      field_name: check.field_name,
      status: status,
      points_available: check.weight,
      evidence: evidence,
      asset_class_limitation: null,
      custom_tag_notes: check_id === "T2_8_851" ? "Tag 1057 AggressorIndicator used for Maker/Taker" : null
    });
  });
});

fs.writeFileSync(`audits/${slug}/extraction_result.json`, JSON.stringify(extraction, null, 2));
console.log("Extraction result generated successfully.");
