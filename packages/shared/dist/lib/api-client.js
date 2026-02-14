"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
class ApiClient {
    constructor(config) {
        this.config = config;
    }
    fetch(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, options = {}) {
            const { baseUrl, getAccessToken } = this.config;
            const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers);
            if (getAccessToken) {
                const token = yield getAccessToken();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }
            const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
            return fetch(url, Object.assign(Object.assign({}, options), { headers }));
        });
    }
    get(endpoint, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.fetch(endpoint, Object.assign(Object.assign({}, options), { method: 'GET' }));
            if (!res.ok) {
                throw new Error(`API Error: ${res.status} ${res.statusText}`);
            }
            const text = yield res.text();
            return text ? JSON.parse(text) : {};
        });
    }
    post(endpoint, body, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.fetch(endpoint, Object.assign(Object.assign({}, options), { method: 'POST', body: JSON.stringify(body) }));
            if (!res.ok) {
                throw new Error(`API Error: ${res.status} ${res.statusText}`);
            }
            const text = yield res.text();
            return text ? JSON.parse(text) : {};
        });
    }
}
exports.ApiClient = ApiClient;
