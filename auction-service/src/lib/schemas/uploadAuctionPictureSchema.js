const schema = {
    properties: {
      body: {
          //Re
        type: 'string',
        minLength: 1,
        pattern: '\=$'
        },
    },
    required: ['body'],
  };
  
  export default schema;