<template>
  <div>
    <h1>Index page</h1>
    message: {{ hello }}
  </div>
</template>

<script>
import gql from "graphql-tag";

export default {
  apollo: {
    hello: gql`
      {
        hello
      }
    `,
  },
};
</script>
