// 共用 js
// 節流器
function throttle(func, timeout = 250) {
    let last;
    let timer;

    return function () {
        const context = this;
        const args = arguments;
        const now = +new Date();
    
        if (last && now < last + timeout) {
            clearTimeout(timer)
            timer = setTimeout(function () {
            last = now
            func.apply(context, args)
            }, timeout)
        } else {
            last = now
            func.apply(context, args)
        }
    }
}

function debounce(func, delay=250) {
    let timer = null;
   
    return () => {
      let context = this;
      let args = arguments;
   
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(context, args);
      }, delay)
    }
  }


