import{g as r,ob as m,qb as o,v as i,y as n}from"./chunk-WJ4ZKYPW.js";var s=o`
  query GetCustomers {
    customers {
      id
      name
      email
      phone
      address
      orders {
        id
      }
    }
  }
`,p=class a{constructor(t){this.apollo=t}getAll(){return this.apollo.watchQuery({query:s,fetchPolicy:"network-only"}).valueChanges.pipe(r(t=>(console.log("GraphQL customers response:",t.data),(t.data?.customers??[]).filter(e=>!!e))))}create(t){return this.apollo.mutate({mutation:o`
          mutation CreateCustomer($input: CreateCustomerInput!) {
            createCustomer(input: $input) {
              id
              name
              email
              phone
              address
              orders {
                id
              }
            }
          }
        `,variables:{input:t},refetchQueries:[{query:s}],awaitRefetchQueries:!0}).pipe(r(e=>(console.log("DEBUG GraphQL createCustomer response:",e),e.data.createCustomer)))}update(t,e){return this.apollo.mutate({mutation:o`
          mutation UpdateCustomer($id: Int!, $input: UpdateCustomerInput!) {
            updateCustomer(id: $id, input: $input) {
              id
              name
              email
              phone
              address
              orders {
                id
              }
            }
          }
        `,variables:{id:t,input:e},refetchQueries:[{query:s}],awaitRefetchQueries:!0}).pipe(r(u=>(console.log("DEBUG GraphQL updateCustomer response:",u),u.data.updateCustomer)))}delete(t){return this.apollo.mutate({mutation:o`
          mutation DeleteCustomer($id: Int!) {
            deleteCustomer(id: $id)
          }
        `,variables:{id:t},refetchQueries:[{query:s}],awaitRefetchQueries:!0}).pipe(r(e=>(console.log("DEBUG GraphQL deleteCustomer response:",e),e.data.deleteCustomer)))}static \u0275fac=function(e){return new(e||a)(n(m))};static \u0275prov=i({token:a,factory:a.\u0275fac,providedIn:"root"})};export{p as a};
