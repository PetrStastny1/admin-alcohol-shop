import{a as u,b as i,g as o,ob as s,qb as r,v as d,y as n}from"./chunk-WJ4ZKYPW.js";var p=class c{constructor(t){this.apollo=t}getProducts(){return this.apollo.watchQuery({query:r`
          query GetProducts {
            products {
              id
              name
              price
              description
              stock
              category {
                id
                name
              }
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe(o(t=>(t.data?.products??[]).filter(e=>!!e)))}getProductsByCategory(t){return this.apollo.watchQuery({query:r`
          query GetProductsByCategory($categoryId: Int!) {
            productsByCategory(categoryId: $categoryId) {
              id
              name
              price
              description
              stock
              category {
                id
                name
              }
            }
          }
        `,variables:{categoryId:t},fetchPolicy:"network-only"}).valueChanges.pipe(o(e=>(e.data?.productsByCategory??[]).filter(a=>!!a)))}create(t){return this.apollo.mutate({mutation:r`
          mutation CreateProduct($input: CreateProductInput!) {
            createProduct(input: $input) {
              id
              name
              price
              description
              stock
              category {
                id
                name
              }
            }
          }
        `,variables:{input:i(u({},t),{isActive:!0})},refetchQueries:["GetProducts",...t.categoryId?[{query:r`
                    query GetProductsByCategory($categoryId: Int!) {
                      productsByCategory(categoryId: $categoryId) {
                        id
                        name
                        price
                        description
                        stock
                        category {
                          id
                          name
                        }
                      }
                    }
                  `,variables:{categoryId:t.categoryId}}]:[]],awaitRefetchQueries:!0}).pipe(o(e=>e.data?.createProduct??null))}update(t,e){return this.apollo.mutate({mutation:r`
          mutation UpdateProduct($id: Int!, $input: UpdateProductInput!) {
            updateProduct(id: $id, input: $input) {
              id
              name
              price
              description
              stock
              category {
                id
                name
              }
            }
          }
        `,variables:{id:t,input:e},refetchQueries:["GetProducts",...e.categoryId?[{query:r`
                    query GetProductsByCategory($categoryId: Int!) {
                      productsByCategory(categoryId: $categoryId) {
                        id
                      }
                    }
                  `,variables:{categoryId:e.categoryId}}]:[]],awaitRefetchQueries:!0}).pipe(o(a=>a.data?.updateProduct??null))}delete(t,e){return this.apollo.mutate({mutation:r`
          mutation DeleteProduct($id: Int!) {
            deleteProduct(id: $id)
          }
        `,variables:{id:t},refetchQueries:["GetProducts",...e?[{query:r`
                    query GetProductsByCategory($categoryId: Int!) {
                      productsByCategory(categoryId: $categoryId) {
                        id
                      }
                    }
                  `,variables:{categoryId:e}}]:[]],awaitRefetchQueries:!0}).pipe(o(a=>a.data?.deleteProduct??!1))}static \u0275fac=function(e){return new(e||c)(n(s))};static \u0275prov=d({token:c,factory:c.\u0275fac,providedIn:"root"})};export{p as a};
