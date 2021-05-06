class Event {
    constructor() {
        // 储存事件的数据结构
        // 为查找迅速， 使用对象（字典）
        this._cache = {};
    }

    // 绑定
    on(type, callback) {
        // 为了按类查找方便和节省空间
        // 将同一类型事件放到一个数组中
        // 这里的数组是队列， 遵循先进先出
        // 即新绑定的事件先触发
        let fns = (this._cache[type] = this._cache[type] || []);
        if (fns.indexOf(callback) === -1) {
            fns.push(callback);
        }
        return this;
    }

    // 触发
    // emit
    emit(type, data) {
        let fns = this._cache[type];
        if (Array.isArray(fns)) {
            fns.forEach((fn) => {
                fn(data);
            });
        }
        return this;
    }

    // 解绑
    off(type, callback) {
        let fns = this._cache[type];
        if (Array.isArray(fns)) {
            if (callback) {
                let index = fns.indexOf(callback);
                if (index !== -1) {
                    fns.splice(index, 1);
                }
            } else {
                // 全部清空
                fns.length = 0;
            }
        }
        return this;
    }
}

class Controller extends Event {
    constructor() {
        super();
        this._duration = 0;
        this.current = 0;
        this.progress = null;
        this.time = null;
        this.gain = null;
    }

    createDom(wrapper = document.body) {
        const container = document.createElement("div");
        container.style.width = "300px";

        const time = document.createElement("span");
        time.innerText = `00:00/${this._formatTime(this._duration)}`;
        this.time = time;

        const progress = document.createElement("input");
        progress.type = "range";
        progress.value = 0;
        progress.style.width = "250px";

        this.progress = progress;

        const gain = document.createElement("input");
        gain.type = "range";
        gain.style.width = "100px";
        this.gain = gain;

        gain.onchange = e => {
            this.emit('gain-change', e.target.value / 100)
        }

        if (typeof wrapper === "string") {
            wrapper = document.querySelector(wrapper) || document.body;
        }

        container.appendChild(progress);
        container.appendChild(gain);
        container.appendChild(time);

        wrapper.appendChild(container);
    }

    updateGain(v) {
        if (!this.gain) {
            return;
        }
        this.gain.value = v * 100;
    }

    updateCurrent(t) {
        if (!this.progress) {
            return;
        }
        this.current = t;
        const percentage = (this.current / this._duration) * 100;
        this.progress.value = percentage;
        this.time.innerHTML = `${this._formatTime(t)}/${this._formatTime(
            this._duration
        )}`;
    }

    set duration(d) {
        this._duration = d;
    }

    _PadZero(str) {
        //补零
        return new RegExp(/^\d$/g).test(str) ? `0${str}` : str;
    }

    _formatTime(_seconds) {
        _seconds = parseInt(_seconds);
        let hours, mins, seconds;
        let result = "";
        seconds = parseInt(_seconds % 60);
        mins = parseInt((_seconds % 3600) / 60);
        hours = parseInt(_seconds / 3600);

        if (hours)
            result = `${this._PadZero(hours)}:${this._PadZero(
                mins
            )}:${this._PadZero(seconds)}`;
        else result = `${this._PadZero(mins)}:${this._PadZero(seconds)}`;
        return result;
    }
}
