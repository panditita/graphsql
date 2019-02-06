const context = require('./context');
const { ObjectId } = require('mongodb');

const { ApolloServer, gql } = require('apollo-server');

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const books = [
	{
		title: 'Harry Potter and the Chamber of Secrets',
		authorId: 1,
		collectionId: 1
	},
	{
		title: 'Jurassic Park',
		authorId: 2,
		collectionId: 2
	},
	{
		title: 'Throne of Glass',
		authorId: 3,
		collectionId: 3
	}
];

const authors = [
	{
		id: 1,
		author: 'J.K. Rowling'
	},
	{
		id: 2,
		author: 'Michael Crichton'
	},
	{
		id: 3,
		author: 'Sarah J. Maas'
	}
];

const collections = [
	{
		id: 1,
		totalBooks: 7
	},
	{
		id: 2,
		totalBooks: 1
	},
	{
		id: 3,
		totalBooks: 10
	}
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
	# Comments in GraphQL are defined with the hash (#) symbol.

	# This "Book" type can be used in other type declarations.
	type Book {
		title: String
		author: Author
		collection: Collection
		_id: String
	}

	type Author {
		author: String
	}

	type Collection {
		totalBooks: Int
	}

	# The "Query" type is the root of all GraphQL queries.
	# (A "Mutation" type will be covered later on.)

	type Query {
		books: [Book]
		book(_id: String): Book
		authors: [Author]
		collections: [Collection]
	}

	type Mutation {
		addBook(title: String!, authorId: Int!): Book
	}
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
	Query: {
		books: async (parent, args, context) => await context.mongo.collection('books').find().toArray(),
		book: async (parent, args, context) => {
			const { _id } = args;
			return await context.mongo.collection('books').findOne(ObjectId(_id));
		},
		authors: () => authors,
		collections: () => collections
	},
	Mutation: {
		addBook: async (parent, args, context) => {
			const { title, authorId } = args;
			return await context.mongo.collection('books').insertOne(args);
			//Add to databse
		}
	},
	Book: {
		author: (parent) => authors.find((author) => author.id === parent.authorId),
		collection: (parent) => collections.find((collections) => collections.id === parent.collectionId)
	}
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers, context });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
	console.log(`🚀  Server ready at ${url}`);
});

console.log(context());
