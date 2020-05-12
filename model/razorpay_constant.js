'user strict';

const razorpayconst = {
    payment_authorized: "authorized",
    payment_captured: "captured",
    payment_failed: "failed",
    refund_created: "created",
    

    //////////////// ========> Demo <========= /////////////////
    dunzo_create_url:'https://apis-staging.dunzo.in/api/v1/tasks?test=true',
    dunzo_client_id : "c6c3acd5-e254-4404-ad06-c0c1d2aafd1e",
    Authorization : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkIjp7InJvbGUiOjEwMCwidWlkIjoiZTRiNDU5ZTktODIxOS00M2Q2LWEyYWQtZDJlODhkOTBlYmI1In0sIm1lcmNoYW50X3R5cGUiOm51bGwsImNsaWVudF9pZCI6ImM2YzNhY2Q1LWUyNTQtNDQwNC1hZDA2LWMwYzFkMmFhZmQxZSIsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL2dvb2dsZS5pZGVudGl0eS5pZGVudGl0eXRvb2xraXQudjEuSWRlbnRpdHlUb29sa2l0IiwibmFtZSI6IkFQSVVTRVIiLCJ1dWlkIjoiZTRiNDU5ZTktODIxOS00M2Q2LWEyYWQtZDJlODhkOTBlYmI1Iiwicm9sZSI6MTAwLCJkdW56b19rZXkiOiIwNmRkZGU1Yy1jODlkLTRiZjgtYjBhMi0wY2Q3NWE2NTVkYWQiLCJleHAiOjE3MjkzMjc1MTAsInYiOjAsImlhdCI6MTU3MzgwNzUxMCwic2VjcmV0X2tleSI6Ik5vbmUifQ.JlCgWiNAcIC82EYqY2MtpT1eoLl-0_yQ88lEkI3j0UY",
   
    //////////////// ========> Live <========= /////////////////
    // dunzo_create_url:'https://api.dunzo.in/api/v1/tasks',
    // dunzo_client_id : "adc7787f-0d6f-4744-8431-2065cda95770",
    // Authorization : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkIjp7InJvbGUiOjEwMCwidWlkIjoiYzEyNzc4MzAtM2Y1Yi00NGQ3LWE3NjktMTU1MmQ4NThiYTlkIn0sIm1lcmNoYW50X3R5cGUiOm51bGwsImNsaWVudF9pZCI6ImFkYzc3ODdmLTBkNmYtNDc0NC04NDMxLTIwNjVjZGE5NTc3MCIsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL2dvb2dsZS5pZGVudGl0eS5pZGVudGl0eXRvb2xraXQudjEuSWRlbnRpdHlUb29sa2l0IiwibmFtZSI6IkVhdCIsInV1aWQiOiJjMTI3NzgzMC0zZjViLTQ0ZDctYTc2OS0xNTUyZDg1OGJhOWQiLCJyb2xlIjoxMDAsImR1bnpvX2tleSI6IjVkZTM1Mjc4LWU3NmItNGNmNS1hN2Y4LTZlMDhmM2FlOTQ5NyIsImV4cCI6MTczMDM2NjExNSwidiI6MCwiaWF0IjoxNTc0ODQ2MTE1LCJzZWNyZXRfa2V5IjoiTm9uZSJ9.dGfcylJZDrYeNOmlSd4_w6YgtYD2g91DFXBSWBOp8hU",
  
}

module.exports = razorpayconst;