const API_BASE_URL = "https://211.21.155.101/api/SP/202205/ForTest";
var selectedNumber;
var memberId;
var bingo;
var board = 3; //3*3的遊戲
var lastUploadImage;

// croppie 設定參數
var width_crop = 1080, // 圖片裁切寬度 px 值
    height_crop = 1350, // 圖片裁切高度 px 值
    type_crop = "square", // 裁切形狀: square 為方形, circle 為圓形
    width_preview = 1080, // 預覽區塊寬度 px 值
    height_preview = 1350, // 預覽區塊高度 px 值
    compress_ratio = 0.8, // 圖片壓縮比例 0~1
    type_img = "jpeg", // 圖檔格式 jpeg png webp
    oldImg = new Image(),
    myCrop,
    file,
    oldImgDataUrl;


// 遊戲設定
function initGame(board, oldStatus) {
    var board = board;
    var gameStatus = [];

    // 有舊資料就存入舊資料，否則依照board大小創造空白陣列
    if (oldStatus) {
        gameStatus = oldStatus;
    } else {
        var length = Math.pow(board, 2);
        for (var n = 0; n < length; n++) {
            gameStatus.push(0);
        }
    }

    return {
        update: function (num) {
            let n = num - 1;
            if (n < Math.pow(board, 2)) {
                gameStatus[n] = 1;
            }
        },
        check: function () {
            let checkStatus = []
            // 縱向判斷
            for (let n = 0; n < board; n++) {
                let temp = 0;
                for (let m = 0; m < board; m++) {
                    let x = n;
                    let y = m;
                    let z = x + y * board;
                    if (gameStatus[z] == 1) {
                        temp++;
                    }
                    // console.log(`x:${x}, y:${y}`)
                    // console.log(`gameStatus[${z}]`)
                }
                if (temp === board) {
                    checkStatus.push(`v${n}`);
                }
            }
            // 橫向判斷
            for (let n = 0; n < board; n++) {
                let temp = 0;
                for (let m = 0; m < board; m++
                ) {
                    let x = m;
                    let y = n;
                    let z = x + y * board;
                    if (gameStatus[z] == 1) {
                        temp++;
                    }
                }
                if (temp === board) {
                    checkStatus.push(`h${n}`);
                }
            }
            // 斜向判斷
            let check_topleft_to_bottomright = 0;
            let check_topright_to_bottomleft = 0;
            for (let n = 0; n < board; n++) {
                let x = n;
                let y = n;
                let z = x + y * board;
                let Z =
                    (y + 1) * board - (x + 1);
                if (gameStatus[z] == 1) {
                    check_topleft_to_bottomright++;
                }
                if (gameStatus[Z] == 1) {
                    check_topright_to_bottomleft++;
                }
                // console.log(`x:${x}, y:${y}`)
                // console.log(`gameStatus[${Z}]: ${gameStatus[Z]}`)
            }
            if (check_topleft_to_bottomright === board) {
                checkStatus.push(`x${1}`);   
            } else if (check_topright_to_bottomleft === board) {
                checkStatus.push(`x${2}`);
            }
            if (checkStatus) return checkStatus
            // 全部檢驗失敗
            return false;
        },
        show: function () {
            // return gameStatus
            for (let n = 0; n < board; n++) {
                let arr = [];
                for (
                    let m = 0;
                    m < board;
                    m++
                ) {
                    let pushTarget =
                        n * board + m;
                    arr.push(
                        gameStatus[pushTarget]
                    );
                }
                console.log(arr);
            }
        },
    };
}
// Promise Ajax
function ajax(options) {
    return new Promise(function (
        resolve,
        reject
    ) {
        $.ajax(options)
            .done(resolve)
            .fail(reject);
    });
}
// 讀取input檔案
function readFile(input) {
    if (input.files && input.files[0]){
        file = input.files[0];
    } else {
        $("body").removeClass("lock")
        alert("瀏覽器不支援此功能！建議使用最新版本 Chrome");
        return;
    }
    
    if (file.type.indexOf("image") == 0) {
        var reader = new FileReader();
        reader.onload = function(e) {
            oldImgDataUrl = e.target.result;
            oldImg.src = oldImgDataUrl; // 載入 oldImg 取得圖片資訊
            myCrop.croppie("bind", {
                url: oldImgDataUrl
            });
        };
        
        reader.readAsDataURL(file);
    } else {
        $("body").removeClass("lock")
        alert("您上傳的不是圖檔！");
    }
}
// base64转blob
const base64ToBlob = function(base64Data) {
    let arr = base64Data.split(','),
        fileType = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        l = bstr.length,
        u8Arr = new Uint8Array(l);
        
    while (l--) {
        u8Arr[l] = bstr.charCodeAt(l);
    }
    return new Blob([u8Arr], {
        type: fileType
    });
};
// blob转file
const blobToFile = function(newBlob, fileName) {
    return new File([newBlob], fileName, { lastModified: new Date().getTime(), type: newBlob.type })
};

// 開發時檢視圖片用(配合bingo.scss把.img_template的css刪掉才能看到)
// function displayCropImg(src) {
//     var html = "<img src='" + src + "' />";
//     $("#newImg").html(html);
// }
// function displayNewImgInfo(src) {
//     var html = "",
//     filesize = src.length * 0.75;
//     html += "<p>裁切圖片尺寸 " + width_crop + "x" + height_crop + "</p>";
//     html += "<p>檔案大小約 " + Math.round(filesize / 1000) + "k</p>";
//     $("#newImgInfo").html(html);
// }


// ==================== step1 讀取使用者資料/設定遊戲 ====================
$(function() {
    function ajax(options) {
        return new Promise(function (
            resolve,
            reject
        ) {
            $.ajax(options)
                .done(resolve)
                .fail(reject);
        });
    }
    ajax({
        url: `${API_BASE_URL}/LoginMember`,
        type: "GET",
        success: function (res) {
            console.log(res);
            memberId = res.data.memberId;
        },
        error: function (res) {
            console.log(res);
        },
    }).then(function () {
        ajax({
            url: `${API_BASE_URL}/Jiugongge`,
            type: "POST",
            data: {
                memberId: `${memberId}`,
            },
            success: function (res) {
                console.log(res.data);
                let datas = res.data
                // let datas = res.data.Jiugongge;
                // let Completion = res.data.Completion;
                // if (res.data.Completion) {
                //     location.href="/prize.html"
                // }_
                var gameStatus = [];

                datas.forEach((data) => {
                    let Ranking = data.Ranking,
                        Id = data.Id,
                        Number = data.Number,
                        PhotoFilePath = data.PhotoFilePath;
                    $(`[data-ranking=${Ranking}]`).attr("id", `${Id}`); //設定格子Id
                    $(`[data-ranking=${Ranking}]`).attr("data-number",`${Number}`); //設定格子Id
                    $(`[data-ranking=${Ranking}] .num div`).text(`${Number}`); //設定格子正面顯示的數字
                    $(`[data-ranking=${Ranking}] .img_box div`).text(`${Number}`); //設定格子反面顯示的數字
                    if (PhotoFilePath !== "") {
                        $(`[data-ranking=${Ranking}] .img_box img`).attr("src",`https://211.21.155.101/${PhotoFilePath}`); //插入圖片
                    }
                    
                    // 依照圖片設定遊戲狀態
                    if (PhotoFilePath !== "") {
                        gameStatus.push(1);
                    } else {
                        gameStatus.push(0);
                    }
                });
                bingo = initGame(
                    board,
                    gameStatus
                ); // 初始化遊戲
                bingo.show(); //顯示遊戲

                // 有照片的格子翻開
                var n = 0;
                $(".bingo_table__item").each(
                    function () {
                        if ($(this).find(".img_box img").attr("src") !=="") {
                            setTimeout(() => {
                                $(this).addClass(
                                    "active"
                                );
                            }, n);
                            n = n + 200;
                        }
                    }
                );
            },
            error: function (res) {
                console.log(res);
            },
        });
    });
});

// ==================== step2 使用者上傳圖片 ====================
$(function() {
    $(".bingo_table__item").on("click", function () {
        // $(".bingo").attr("style", "pointer-events: none;")
        // $(".btn.select").attr("style", "pointer-events: auto;")
        if (!$(this).hasClass("active")) {
            selectedNumber = $(this).data("number");
            $(".selected_number").text(selectedNumber);
            $(".upload").addClass("active");
        }
    });
    
    $("#upload_input").on("change", function() {
        $(".spinner_wrapper").addClass("active")
        $("body").addClass("lock")
        $("#oldImg").croppie('destroy');

        // 裁切初始參數設定
        myCrop = $("#oldImg").croppie({
            viewport: { // 裁切區塊
                width: width_crop,
                height: height_crop,
                type: type_crop
            },
            boundary: { // 預覽區塊
                width: width_preview,
                height: height_preview
            },
            enableZoom: false,
            showZoomer: false

        });
        $("#oldImg").show();
        readFile(this);
        setTimeout(() => {
            $("#crop_img").trigger("click")
        }, 2000)
    });
    
    oldImg.onload = function() {
        var width = this.width,
        height = this.height,
        fileSize = Math.round(file.size / 1000)
        // html = "";
        
        // html += "<p>原始圖片尺寸 " + width + "x" + height + "</p>";
        // html += "<p>檔案大小約 " + fileSize + "k</p>";
        // $("#oldImg").before(html);
    };
    
    $("#crop_img").on("click", function() {
        console.log("click")
        myCrop.croppie("result", {
            type: "canvas",
            format: type_img,
            quality: compress_ratio
        }).then(function(src) {
            // displayNewImgInfo(src)
            // displayCropImg(src)
            var data = new FormData();
            // var file = $("#upload_input")[0].files[0]  //原檔測試用

            // 壓縮後轉檔
            var blob = base64ToBlob(src)    //Base64 > blob
            var file = blobToFile(blob, "cropImg.jpg")  // blob > file
            data.append("memberId", memberId);
            data.append("number", selectedNumber);
            data.append("photo", file);
            
            lastUploadImage = src
            console.log(src)
            // 上傳圖片
            ajax({
                url: `${API_BASE_URL}/UploadPhoto`,
                type: "POST",
                data: data,
                contentType: false, // 必須
                processData: false, // 必須
                success: function (res) {
                    console.log(res)
                    // 更新遊戲資料
                    let block = $(`[data-number=${selectedNumber}]`)
                    let ranking = $(block).attr("data-ranking")
                    switch(res.statusCode) {
                        // 比對數字成功
                        case 0 :
                            console.log("success")
                            // 更新遊戲內部資料
                            bingo.update(ranking)
                            bingo.show()

                            // 圖片上傳區塊隱藏
                            $(".upload.active").removeClass("active")
                            
                            // 下方資訊更新
                            $(".result.active").removeClass("active")
                            $(".rules").addClass("d-none")
                            $(".result.succeed").addClass("active")
                            console.log( $(block))
                            // 配對成功格子插入圖片並轉面
                            $(block).addClass("active").find("img").attr("src", `${lastUploadImage}`)
                            break;

                        // 比對數字失敗
                        case 5001 : 
                            console.log("fail")
                            // 下方資訊更新
                            $(".upload.active").removeClass("active")
                            $(".result.active").removeClass("active")
                            $(".rules").addClass("d-none")
                            $(".result.failed").addClass("active")

                            break;

                        default :
                            $(".spinner_wrapper").removeClass("active")
                            $("#upload_input").val("")
                            break;
                    }
            
                },
                error: function (res) {
                    console.log(res);
                },
            }).then(function (res) {
                $("body").removeClass("lock")
                $(".spinner_wrapper").removeClass("active")
                let checkStatus = bingo.check();
                // 成功連線
                if (checkStatus.length > 0) {
                    console.log("complete")
                    $(".bingo").attr("style", "pointer-events: none;")
                    let bingoHtml = $(".bingo")
                    let className = ""
                    for (let i=0; i<checkStatus.length; i++) {
                        switch (checkStatus[i]) {
                            case "v0" :
                                className = "vertical_fst active";
                                break;
                            case "v1" :
                                className = "vertical_snd active";
                                break;
                            case "v2" :
                                className = "vertical_trd active";
                                break;
                            case "h0" :
                                className = "horizontal_fst active";
                                break;
                            case "h1" :
                                className = "horizontal_snd active";
                                break;
                            case "h2" :
                                className = "horizontal_trd active";
                                break;
                            case "x1" :
                                className = "left_top__right_bottom active";
                                break;
                            case "x2" :
                                className = "right_top__left_bottom active";
                                break;
                            default :
                                break;
                        }
                        let lineHtml =  `<div class="bingo_line_box ${className}">
                                            <div class="bingo_line"></div>
                                        </div>`
                        $(bingoHtml).append(lineHtml)
                    }
                    console.log("appended")
                    // 下方資訊更新
                    $(".result").removeClass("active")
                    $(".rules").removeClass("active")
                    $(".result.complete").addClass("active")
                    
                } 
                // 清空input(必要，避免上同張圖無法觸發onChange事件)
                $("#upload_input").val("")
            });
        });
   
    });
});

// ==================== step3 監聽分享 ====================
$(function() {


    $(".line").on("click", function() {
        console.log("click")
        ajax({
            url: `${API_BASE_URL}/CompleteGame`,
            type: "POST",
            data: {
                memberId: `${memberId}`,
            },
            success: function (res) {
                if (res.statusCode === 0) console.log(res)
                // location.href=`${res.data}` 
            },
            error: function (res) {
                console.log(res);
            },
        })
    })
    $(".download").on("click", function() {
        console.log("click")
        ajax({
            url: `${API_BASE_URL}/CompleteGame`,
            type: "POST",
            data: {
                memberId: `${memberId}`,
            },
            success: function (res) {
                if (res.statusCode === 0) console.log(res)
                // location.href=`${res.data}`
         
            },
            error: function (res) {
                console.log(res);
            },
        })
    })  
    $(".facebook").on("click", function() {
        FB.ui(
            {
                method: 'share',
                href: 'https://www.honda-taiwan.com.tw/SP/202205/', 
            },
            // callback
            function(response) {
                console.log(response)
                if (response && !response.error_message) {
                    alert('Posting completed.');
                    ajax({
                        url: `${API_BASE_URL}/CompleteGame`,
                        type: "POST",
                        data: {
                            memberId: `${memberId}`,
                        },
                        success: function (res) {
                            if (res.statusCode === 0) console.log(res)
                            // location.href=`${res.data}`
                        },
                        error: function (res) {
                            console.log(res);
                        },
                    })
                } else {
                    alert('Error while posting.');
                }
            }
        );  
    })
})
