import{g as r,ob as p,qb as a,v as u,y as l}from"./chunk-WJ4ZKYPW.js";var o=a`
  query GetCategories {
    categories {
      id
      name
      description
    }
  }
`,s=class i{constructor(e){this.apollo=e}getAll(){return this.apollo.watchQuery({query:o,fetchPolicy:"network-only"}).valueChanges.pipe(r(e=>e.data?.categories??[]))}getById(e){return this.apollo.watchQuery({query:a`
          query GetCategory($id: Int!) {
            category(id: $id) {
              id
              name
              description
            }
          }
        `,variables:{id:e},fetchPolicy:"network-only"}).valueChanges.pipe(r(t=>t.data?.category??null))}create(e,t){return this.apollo.mutate({mutation:a`
          mutation CreateCategory($input: CreateCategoryInput!) {
            createCategory(input: $input) {
              id
              name
              description
            }
          }
        `,variables:{input:{name:e,description:t}},refetchQueries:[{query:o}],awaitRefetchQueries:!0}).pipe(r(n=>n.data?.createCategory??null))}update(e,t,n){return this.apollo.mutate({mutation:a`
          mutation UpdateCategory($input: UpdateCategoryInput!) {
            updateCategory(input: $input) {
              id
              name
              description
            }
          }
        `,variables:{input:{id:e,name:t,description:n}},refetchQueries:[{query:o}],awaitRefetchQueries:!0}).pipe(r(y=>y.data?.updateCategory??null))}delete(e){return this.apollo.mutate({mutation:a`
          mutation DeleteCategory($id: Int!) {
            deleteCategory(id: $id)
          }
        `,variables:{id:e},refetchQueries:[{query:o}],awaitRefetchQueries:!0}).pipe(r(t=>t.data?.deleteCategory??!1))}static \u0275fac=function(t){return new(t||i)(l(p))};static \u0275prov=u({token:i,factory:i.\u0275fac,providedIn:"root"})};export{s as a};
