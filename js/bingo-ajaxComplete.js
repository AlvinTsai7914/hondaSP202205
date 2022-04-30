const API_BASE_URL = "https://211.21.155.101/api/SP/202205/ForTest";
var selectedNumber;
var memberId;
var bingo;
var board = 3; //3*3的遊戲

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
            console.log("checking start")
            // 縱向判斷
            for (let n = 0; n < board; n++) {
                let temp = 0;
                for (
                    let m = 0;
                    m < board;
                    m++
                ) {
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
                    return true;
                }
            }
            // 橫向判斷
            for (let n = 0; n < board; n++) {
                let temp = 0;
                for (
                    let m = 0;
                    m < board;
                    m++
                ) {
                    let x = m;
                    let y = n;
                    let z = x + y * board;
                    if (gameStatus[z] == 1) {
                        temp++;
                    }
                }
                if (temp === board) {
                    return true;
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
            if (
                check_topleft_to_bottomright ===
                    board ||
                check_topright_to_bottomleft ===
                    board
            ) {
                return true;
            }
            console.log("checking end")
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
    // newBlob.lastModifiedDate = new Date();
    // newBlob.name = fileName;
    // return newBlob;
    return new File([newBlob], fileName, { lastModified: new Date().getTime(), type: newBlob.type })
};
 // ========== step1 讀取使用者資料/設定遊戲 ==========
$(function () {
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
                let datas = res.data;
                var gameStatus = [];

                datas.forEach((data) => {
                    let Ranking = data.Ranking,
                        Id = data.Id,
                        Number = data.Number,
                        PhotoFilePath =
                            data.PhotoFilePath;
                    $(`[data-ranking=${Ranking}]`).attr("id", `${Id}`); //設定格子Id
                    $(`[data-ranking=${Ranking}]`).attr("data-number",`${Number}`); //設定格子Id
                    $(`[data-ranking=${Ranking}] .num div`).text(`${Number}`); //設定格子正面顯示的數字
                    $(`[data-ranking=${Ranking}] .img_box div`).text(`${Number}`); //設定格子反面顯示的數字
                    $(`[data-ranking=${Ranking}] .img_box img`).attr("src",`${PhotoFilePath}`); //插入圖片
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
                        if (
                            $(this)
                                .find(
                                    ".img_box img"
                                )
                                .attr("src") !==
                            ""
                        ) {
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

    // 完成遊戲
    // $.ajax({
    //     url: `${API_BASE_URL}/CompleteGame`,
    //     type: "POST",

    //     success: function(response){
    //         console.log(responsee)
    //     }
    // });

    // 讀取後，依序掀開卡片

    // ========== step2 使用者上傳圖片 ==========
    // 選取檔案 + 上傳
    // const fileUploader = $("#upload_img");
    // // 點卡片啟動上傳區塊
    // $(".bingo_table__item").on(
    //     "click",
    //     function () {
    //         if (!$(this).hasClass("active")) {
    //             selectedNumber =
    //                 $(this).data("number");
    //             $(".selectedNumber").text(
    //                 selectedNumber
    //             );
    //             $(".upload").addClass("active");
    //         }
    //     }
    // );

    // $(fileUploader).on("change", (e) => {
    //     smallerImg()
    //     var formData = new FormData(
    //         $("#upload_form")[0]
    //     );
    //     var files = e.target.files;
    //     drawImage(files[0], 0, 0, 320, 320);
    //     if (files.length > 0) {
    //         formData.append("memberId", memberId);
    //         formData.append(
    //             "number",
    //             selectedNumber
    //         );
    //         formData.append("Photo", files[0]);
    //     }
    //     console.log(formData);

    //     ajax({
    //         url: `${API_BASE_URL}/UploadPhoto`,
    //         type: "POST",
    //         data: formData,
    //         async: false,
    //         cache: false,
    //         contentType: false,
    //         processData: false,
    //         success: function (res) {
    //             console.log(res);
    //         },
    //         error: function (res) {
    //             console.log(res);
    //         },
    //     }).then(function (res) {
    //         console.log(res);
    //     });

    //     // 數字配對成功，讀取圖片資料放入九宮格
    //     // var reader = new FileReader();
    //     // reader.readAsDataURL(files[0]);
    //     // reader.onloadend = async function(e){
    //     //     $(`[data-number=${selectedNumber}]`).find(".img_box img").attr("src", e.target.result)
    //     //     $(`[data-number=${selectedNumber}]`).addClass("active")
    //     // }

    //     // $(".upload").removeClass("active")
    // });

    // var game = initGame(board, oldStatus)
    // game.update(1)
    // game.update(5)
    // game.update(8)
    // game.update(6)
    // game.update(9)
    // game.show()
    // console.log(game.check())
});


// ========== step2 使用者上傳圖片 ==========
$(function () {
    // croppie 設定
    var width_crop = 1080, // 圖片裁切寬度 px 值
        height_crop = 1080, // 圖片裁切高度 px 值
        type_crop = "square", // 裁切形狀: square 為方形, circle 為圓形
        width_preview = 350, // 預覽區塊寬度 px 值
        height_preview = 350, // 預覽區塊高度 px 值
        compress_ratio = 1, // 圖片壓縮比例 0~1
        type_img = "jpeg", // 圖檔格式 jpeg png webp
        oldImg = new Image(),
        myCrop,
        file,
        oldImgDataUrl,
        fileName;

        $(".bingo_table__item").on(
            "click",
            function () {
                if (!$(this).hasClass("active")) {
                    selectedNumber = $(this).data("number");
                    console.log(selectedNumber)
                    $(".selected_number").text(selectedNumber);
                    $(".upload").addClass("active");
                }
            }
        );
        

        
        function readFile(input) {
            if (input.files && input.files[0]){
                file = input.files[0];
            } else {
                alert("瀏覽器不支援此功能！建議使用最新版本 Chrome");
                return;
            }
            
            if (file.type.indexOf("image") == 0) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    console.log(input.files[0])
                    oldImgDataUrl = e.target.result;
                    oldImg.src = oldImgDataUrl; // 載入 oldImg 取得圖片資訊
                    myCrop.croppie("bind", {
                        url: oldImgDataUrl
                    });
                };
                
                reader.readAsDataURL(file);
            } else {
                alert("您上傳的不是圖檔！");
            }
        }
        
        function displayCropImg(src) {
            var html = "<img src='" + src + "' />";
            $("#newImg").html(html);
        }
        
        $("#upload_img").on("change", function() {
            $("#oldImg").croppie('destroy');
            
            // var fileData = this.files[0];
            // console.log(fileData)
            // //讀取圖片設定寬高
            // var reader = new FileReader();
            // reader.onload = function (e) {
            //     var data = e.target.result;
            //     var image = new Image();
            //     image.onload=function(){
            //         width_crop = image.width;
            //         height_crop = image.height;
            //         width_preview = image.width;
            //         height_preview = image.height;
            //         alert("宽：："+width_crop+"高：："+height_crop)
            //     };
            //     image.src= data;
            // };
            // reader.readAsDataURL(fileData);


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
                }
            });
            $("#oldImg").show();
            readFile(this);
        });
        
        oldImg.onload = function() {
            var width = this.width,
            height = this.height,
            fileSize = Math.round(file.size / 1000),
            html = "";
            
            html += "<p>原始圖片尺寸 " + width + "x" + height + "</p>";
            html += "<p>檔案大小約 " + fileSize + "k</p>";
            $("#oldImg").before(html);
        };
        
        function displayNewImgInfo(src) {
            var html = "",
            filesize = src.length * 0.75;
            
            html += "<p>裁切圖片尺寸 " + width_crop + "x" + height_crop + "</p>";
            html += "<p>檔案大小約 " + Math.round(filesize / 1000) + "k</p>";
            $("#newImgInfo").html(html);
        }
        
        $("#crop_img").on("click", function() {
            myCrop.croppie("result", {
                type: "canvas",
                format: type_img,
                quality: compress_ratio
            }).then(function(src) {
                displayNewImgInfo(src)
                displayCropImg(src)
                var data = new FormData();
                // var file = $("#upload_img")[0].files[0]  //原檔測試用

                // 壓縮後轉檔
                var blob = base64ToBlob(src)    //Base64 > blob
                var file = blobToFile(blob, "cropImg.jpg")  // blob > file
                console.log(file)
                data.append("memberId", memberId);
                data.append("number", selectedNumber);
                data.append("photo", file);

                // const reader = new FileReader()
                // 轉換成 DataURL
                // reader.readAsDataURL(file)
                
                // reader.onload = function() {
                //     // 創造一個 a 標籤
                //     const downloadLink = document.createElement('a')
                //     // 將 a 標籤的連結改為 DataURL
                //     downloadLink.href = reader.result
                //     // 將下載的檔名設定為 file
                //     downloadLink.download = 'file'
                //     // 點擊標籤
                //     downloadLink.click()
                // }
                
            
                // 上傳圖片
                ajax({
                    url: `${API_BASE_URL}/UploadPhoto`,
                    type: "POST",
                    data: data,
                    contentType: false, // 必須
                    processData: false, // 必須
                    success: function (res) {
                        console.log(res);
                        switch(res.statusCode) {
                            // 比對成功
                            case 0 :
                                console.log("success")
                                $(".upload.active").removeClass("active")
                                $(".result.active").removeClass("active")
                                $(".rules").addClass("d-none")
                                $(".result.succeed").addClass("active")
                                let ranking = $(`[data-number=${selectedNumber}]`).attr("data-ranking")
                                bingo.update(ranking)
                                break;

                            // 比對失敗
                            case 5001 : 
                                console.log("fail")
                                $(".upload.active").removeClass("active")
                                $(".result.active").removeClass("active")
                                $(".rules").addClass("d-none")
                                $(".result.failed").addClass("active")
                                console.log($(`[data-number=${selectedNumber}]`).attr("data-ranking"))
                                break;
                            default :
                                break;
                        }
                        if(bingo.check()) {
                            $(".result.active").removeClass("active")
                            $(".result.complete").addCLass("active")
                        }
                    },
                    error: function (res) {
                        console.log(res);
                    },
                }).then(function (res) {
                    console.log(res);
                });
            });
        });
});