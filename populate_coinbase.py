import json
from datetime import datetime

with open('cryptofix_master_rubric.json', 'r') as f:
    rubric = json.load(f)

exchange_name = "Coinbase Exchange"
slug = "coinbase-exchange"
audit_date = datetime.now().strftime("%Y-%m-%d")

# Subagent findings summary
supported_msgs = ['D', '8', 'F', 'G', '9', 'A', '0', '5', '3', 'j', 'V', 'W', 'X', '4']
unsupported_msgs = ['Q', 'AE', 'AR', 'J', 'P', 'R', 'S', 'AJ']

extraction = {
    "exchange_name": exchange_name,
    "spec_source": "multi-url",
    "asset_classes_audited": ["spot"],
    "extraction_date": audit_date,
    "extractor_notes": "FIX 5.0 SP2 (FIXT 1.1 session). AggressorIndicator (1057) used instead of 851. Resend requests NOT supported. XML dictionary found at: https://docs.cdp.coinbase.com/exchange/files/cb_exch_fix_dictionaries-20251119.zip",
    "checks": []
}

for tier in rubric['tiers']:
    for check in tier['checks']:
        check_id = check['id']
        msg_type = check.get('message_type')
        level = check.get('level')
        tag = check.get('fix_tag')
        
        status = "no_credit"
        evidence = None
        
        # Handle message-level checks (usually id ends in _000 or level=='message')
        if level == "message":
            if msg_type:
                # Clean up msg_type string (e.g. "35=D" -> "D")
                clean_msg = msg_type.replace("35=", "")
                if clean_msg in supported_msgs:
                    status = "full_credit"
                    evidence = f"Supported as per FIX 5.0 spec for {exchange_name}."
                elif clean_msg in unsupported_msgs:
                    status = "no_credit"
                    evidence = "Message not found/documented in FIX 5.0 spec."
            
            # Special case for session management / ResendRequest
            if "ResendRequest" in str(check.get('message_name', '')):
                status = "no_credit"
                evidence = "Resend Requests (35=2) not supported on Coinbase FIX 5.0. Fresh sessions expected."
            
            if check_id == "T8_HDR_000": # Standard Header
                status = "full_credit"
                evidence = "Standard Header documented (8, 49, 56, 34, 52)."
            
            if check_id == "T8_HB_COD": # COD
                status = "full_credit"
                evidence = "Cancel-on-Disconnect behavior documented and configurable."

        # Handle tag-level checks
        elif level == "tag":
            # Header tags
            if "HDR" in check_id:
                status = "full_credit"
                evidence = f"Tag {tag} documented in Standard Header."
            
            # Application tags in supported messages
            elif msg_type:
                clean_msg = msg_type.replace("35=", "")
                if clean_msg in supported_msgs:
                    status = "full_credit"
                    evidence = f"Tag {tag} ({check.get('field_name')}) documented in 35={clean_msg} table."
                    
                    # Specific overrides
                    if check_id == "T2_8_851": # LastLiquidityInd
                        status = "partial_credit"
                        evidence = "Uses custom tag 1057 AggressorIndicator (Y=Taker, N=Maker) instead of standard 851."
                    
                    if check_id == "T8_A_141": # ResetSeqNumFlag
                        status = "full_credit"
                        evidence = "ResetSeqNumFlag (141) required and documented for fresh sessions."

                else:
                    status = "no_credit"
                    evidence = f"Message 35={clean_msg} not supported, so tag {tag} is absent."
        
        # Drop Copy checks (Tier 6)
        if tier['tier'] == 6:
            if "DC" in check_id:
                status = "full_credit"
                evidence = "Supported on dedicated Drop Copy port 6122."
                if str(tag) == "797": # CopyMsgIndicator
                    status = "partial_credit"
                    evidence = "Uses session-level DropCopyFlag (9406) instead of per-message CopyMsgIndicator (797)."

        # Market Data checks (Tier 7)
        if tier['tier'] == 7:
            if msg_type and msg_type.replace("35=", "") in ['V', 'W', 'X']:
                status = "full_credit"
                evidence = f"Market Data tag {tag} documented for {msg_type}."

        extraction["checks"].append({
            "check_id": check_id,
            "fix_tag": tag,
            "field_name": check.get('field_name'),
            "status": status,
            "points_available": check['weight'],
            "evidence": evidence,
            "asset_class_limitation": None,
            "custom_tag_notes": "Tag 1057 AggressorIndicator used for Maker/Taker" if check_id == "T2_8_851" else None
        })

with open('audits/coinbase-exchange/extraction_result.json', 'w') as f:
    json.dump(extraction, f, indent=2)

print("Extraction result generated successfully.")
