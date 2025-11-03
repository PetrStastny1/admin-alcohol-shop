import{g as a,lb as l,ob as c,v as n,y as s}from"./chunk-WJ4ZKYPW.js";var i=class r{KEY="auth_token";getToken(){return localStorage.getItem(this.KEY)}setToken(e){localStorage.setItem(this.KEY,e)}removeToken(){localStorage.removeItem(this.KEY)}isLoggedIn(){return!!this.getToken()}static \u0275fac=function(t){return new(t||r)};static \u0275prov=n({token:r,factory:r.\u0275fac,providedIn:"root"})};var g=class r{constructor(e,t){this.apollo=e;this.tokenService=t;this.loadUserFromStorage()}currentUser=null;login(e,t){return this.apollo.mutate({mutation:l`
          mutation Login($username: String!, $password: String!) {
            login(username: $username, password: $password) {
              access_token
              id
              username
              role
            }
          }
        `,variables:{username:e,password:t}}).pipe(a(m=>{let o=m.data?.login??null;return o?.access_token&&(this.tokenService.setToken(o.access_token),this.currentUser=o,localStorage.setItem("currentUser",JSON.stringify(o))),o}))}logout(){this.tokenService.removeToken(),this.currentUser=null,localStorage.removeItem("currentUser")}isLoggedIn(){return this.tokenService.isLoggedIn()}getToken(){return this.tokenService.getToken()}getCurrentUser(){return this.currentUser}getUserRole(){return this.currentUser?.role??null}isAdmin(){return this.getUserRole()==="admin"}loadUserFromStorage(){let e=localStorage.getItem("currentUser");e&&(this.currentUser=JSON.parse(e))}static \u0275fac=function(t){return new(t||r)(s(c),s(i))};static \u0275prov=n({token:r,factory:r.\u0275fac,providedIn:"root"})};export{g as a};
