import{ab as c,g as l,lb as p,ob as g,v as n,y as s}from"./chunk-WJ4ZKYPW.js";var i=class o{KEY="auth_token";getToken(){return localStorage.getItem(this.KEY)}setToken(e){localStorage.setItem(this.KEY,e)}removeToken(){localStorage.removeItem(this.KEY)}isLoggedIn(){return!!this.getToken()}static \u0275fac=function(r){return new(r||o)};static \u0275prov=n({token:o,factory:o.\u0275fac,providedIn:"root"})};var m=class o{constructor(e,r){this.apollo=e;this.tokenService=r;this.loadUserFromStorage()}currentUser=null;login(e,r){return console.log("\u{1F680} Spou\u0161t\xEDm login mutation p\u0159es Apollo..."),this.apollo.mutate({mutation:p`
          mutation Login($username: String!, $password: String!) {
            login(username: $username, password: $password) {
              access_token
              id
              username
              role
            }
          }
        `,variables:{username:e,password:r},context:{headers:new c({"Content-Type":"application/json","x-apollo-operation-name":"Login","apollo-require-preflight":"true"})}}).pipe(l(a=>{console.log("\u{1F6F0}\uFE0F Apollo response:",a);let t=a.data?.login??null;return t?.access_token&&(this.tokenService.setToken(t.access_token),this.currentUser=t,localStorage.setItem("currentUser",JSON.stringify(t))),t}))}logout(){this.tokenService.removeToken(),this.currentUser=null,localStorage.removeItem("currentUser")}isLoggedIn(){return this.tokenService.isLoggedIn()}getToken(){return this.tokenService.getToken()}getCurrentUser(){return this.currentUser}getUserRole(){return this.currentUser?.role??null}isAdmin(){return this.getUserRole()==="admin"}loadUserFromStorage(){let e=localStorage.getItem("currentUser");e&&(this.currentUser=JSON.parse(e))}static \u0275fac=function(r){return new(r||o)(s(g),s(i))};static \u0275prov=n({token:o,factory:o.\u0275fac,providedIn:"root"})};export{m as a};
