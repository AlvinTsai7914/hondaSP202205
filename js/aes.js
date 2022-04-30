$(function() {
    const customId = "2021072316816888";
    var timeStamp = Math.round(+new Date() / 1000);
    var str = customId + timeStamp; // 原始字串
    // var str = "20210723168168881638869916";
    var key = CryptoJS.enc.Utf8.parse('honDa@TaIwan#168#A1#NAWiAt@aDNOH');     // Use Utf8-Encoder. 
    var iv  = CryptoJS.enc.Utf8.parse('#A1#NAWiAt@aDNOH');                     // Use Utf8-Encoder

    var encryptedCP = CryptoJS.AES.encrypt(str, key, { iv: iv });
    var decryptedWA = CryptoJS.AES.decrypt(encryptedCP, key, { iv: iv });

    var encryptedBase64 = encryptedCP.toString();                              // Short for: encryptedCP.ciphertext.toString(CryptoJS.enc.Base64);
    var decryptedUtf8 = decryptedWA.toString(CryptoJS.enc.Utf8);               // Avoid the Base64 detour.
                                                                            // Alternatively: CryptoJS.enc.Utf8.stringify(decryptedWA);  
    console.log("Ciphertext (Base64)  : " + encryptedBase64)
    console.log("Decrypted data (Utf8): " + decryptedUtf8); 
    console.log("str: " + str)
})