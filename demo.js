/**
 * @summary MONGO DB
 */

//#region CREATE OPERATIONS

/**
 * @summary Variations of Inserts in a document
 *
 * @type insertOne - insert single document
 * @type insertMany - insert either single or multiple documents in an array
 * @type insert - older variant does do insert but output does not return ObjectId
 *
 */

db.persons.insertOne({ name: 'Max', age: 27, hobbies: ['Sports', 'Cooking'] });
db.persons.insertOne({ name: 'Manuel', age: 31, hobbies: ['Cars', 'Cooking'] });

db.persons.insertMany([{ name: 'Anna', age: 29, hobbies: ['Sports', 'Yoga'] }]);
db.persons.insertMany([
  { name: 'Maria', age: 31 },
  { name: 'Chris', age: 25 },
]);

/**
 * @summary Import data from json file into MONGO DB
 * @param drop the drop option will drop an existing database with same collection and relace it with the imported data
 * @param jsonArray  import the data as a json array
 *
 * @command  mongoimport <"path to json file"> -d <"databse name"> -c <"collection name"> --jsonArray --drop
 */

// writeConcern 0 doesnt give us confirmation of adding to db response will not give objectId of newly created document
db.persons.insertOne({ name: 'Lorenz', age: 31 }, { writeConcern: { w: 1 } });
db.persons.insertOne({ name: 'Mikaela', age: 35 }, { writeConcern: { w: 1, j: true } });
db.persons.insertOne({ name: 'Bonzo', age: 47 }, { writeConcern: { w: 1, j: true, wtimeout: 200 } });

/**
 * README File
  
  # Mongo DB

  ## Variations of Inserts in a document  
  
  > **insertOne** - inserts a single document
  > **insertMany** - inserts either single or multiple documents in an array
  > **insert** - older variant does do insert but output does not return ObjectId
  
  ```sh
  db.persons.insertOne({ name: 'Max', age: 27, hobbies: ['Sports', 'Cooking'] });
  ```
  ```sh
  db.persons.insertOne({ name: 'Manuel', age: 31, hobbies: ['Cars', 'Cooking'] });
  ```
  ```sh
  db.persons.insertMany([{ name: 'Anna', age: 29, hobbies: ['Sports', 'Yoga'] }]);
  ```
  ```sh
  db.persons.insertMany([
    { name: 'Maria', age: 31 },
    { name: 'Chris', age: 25 },
  ]);
  ```

 */

//#endregion

//#region READ OPERATIONS

/**
 * @summary COMPARISON OPERAATORS
 *
 * @param eq - use to check equality
 * @param ne - not equal
 * @param gt - greater than
 * @param lt - less than
 * @param lte - less than or equal to
 * @param gte - greater than or equal to
 *
 */

// not equal to
db.movies.find({ runtime: { $ne: 60 } });
// less than
db.movies.find({ runtime: { $lt: 60 } });

/**
 * Query Embedded fields and Array
 */

// rating: { average: 8.0 }
db.movies.find({ 'rating.average': { $gt: 7 } });

// genres: ["Thriller", "Drama"]
db.movies.find({ genres: 'Drama' });

// genres: ["Drama"]
db.movies.find({ genres: ['Drama'] });

/**
 * @summary COMPARISON OPERAATORS
 * other comparison operators
 * @param in - matches the values in the array
 * @param nin - matches values except those in array
 */

// find results with runtime either 30 or 42
db.movies.find({ runtime: { $in: [30, 42] } });

// find results with runtime neither 30 or 42
db.movies.find({ runtime: { $nin: [30, 42] } });

/**
 * @summary LOGICAL OPERATORS
 * other comparison operators
 * @param or - matches docs if any condition in array matches
 * @param and - matches docs that match all condition specified in the array
 */

// find results with rating average less than 5 (lowest rated shows) or greater than 9 (highest rated shows)
db.movies.find({ $or: [{ 'rating.average': { $lt: 5 } }, { 'rating.average': { $gt: 9 } }] }).pretty();

// find results with rating average greater than 9 (highest rated shows) and genre of Drama
db.movies.find({ $and: [{ 'rating.average': { $gt: 9 } }, { genres: 'Drama' }] }).pretty();

//Alternate syntax
db.movies.find({ 'rating.average': { $gt: 9 }, genres: 'Drama' }).pretty();

// If using the same field then have to use $and syntax as JavScript doesn't permit same name (eg: genres) in object
db.movies.find({ $and: [{ genres: 'Horror' }, { genres: 'Drama' }] }).pretty();

// not 60
db.movies.find({ runtime: { $not: { $eq: 60 } } }).count();

// find people who have phone number
db.persons.find({ ph: { $exists: true } });

// Combine conditions
db.persons.find({ ph: { $exists: true, $gte: 20 } });

// check for not equal to null
db.persons.find({ ph: { $exists: true, $ne: null } });

// check for phone number of type string
db.persons.find({ ph: { $type: 'string' } });

// check for ph of type string or double
db.persons.find({ ph: { $type: ['string', 'double'] } });

/**
 * @summary EVALUATION OPERATORS
 * @param regex
 * @param expr
 */

//  regex match to find movies which contain the word musical in their summary
db.movies.find({ summary: { $regex: /musical/ } });

db.sales.insertMany([
  { volume: 100, target: 120 },
  { volume: 89, target: 80 },
  { volume: 200, target: 177 },
]);

db.sales.find({ $expr: { $gt: ['$volume', '$target'] } }).pretty();

db.sales
  .find({
    $expr: {
      $gt: [
        { $cond: { if: { $gte: ['$volume', '$target'] }, then: { $subtract: ['$volume', 10] }, else: '$target' } },
        '$target',
      ],
    },
  })
  .pretty();

/**
 * @summary ARRAY OPERATORS
 * @param size
 * @param all
 * @param elemMatch
 */

// finds user who have exactly 3 hobbies
db.users.find({ hobbies: { $size: 3 } });

// finds movies that have genre action and thriller in the same order
db.movies.find({ genres: ['action', 'thriller'] });

// finds movies that have genre action and thriller but ignores order
db.movies.find({ genres: { $all: ['action', 'thriller'] } });

db.users.find({ hobbies: { $elemMatch: { title: 'Sports', frequency: 3 } } });

/** CURSOR OPERATIONS
 * @param sort
 * @param skip
 * @param limit
 * @param projection
 * @param slice
 */

//1 for ascending -1 for descending sort
db.movies.find().sort({ 'rating.average': -1 });

// pagination for skip and limit
db.movies.find().sort({ 'rating.average': -1 }).skip(2).limit(5);

// projection
db.movies.find({}, { name: 1 });

// slice
db.movies.find({}, { name: 1, genres: { $slice: 2 } });
// slice first ele denotes elements to skip and seconds is the number to show
db.movies.find({}, { name: 1, genres: { $slice: [1, 2] } });

//#endregion

//#region UPDATE OPERATIONS

/**
 * @summary UPDATE OPERAATORS
 * @param set
 * @param inc
 */

// updates the hobbies array
db.users.updateOne({ name: 'Chris' }, { $set: { hobbies: [{ title: 'Sports', frequency: 5 }] } });

db.users.updateMany({ 'hobbies.title': 'Sports' }, { $set: { isSporty: true } });

// update multiple fields using set
db.users.updateOne({ name: 'Chris' }, { $set: { ph: 912345670, age: 37 } });
// increment the age of Chris by 1
db.users.updateOne({ name: 'Chris' }, { $inc: { age: 1 } });
// decrement the age of Chris by 1
db.users.updateOne({ name: 'Chris' }, { $inc: { age: -2 } });

/**
 * @summary UPDATE OPERAATORS
 * @param min
 * @param max
 * @param mul
 */

// want to set age to 35 if it is greater than 35
db.users.updateOne({ name: 'Chris' }, { $min: { age: 35 } });
// will not update as 35 < 38 so will not update age to 38
db.users.updateOne({ name: 'Chris' }, { $min: { age: 38 } });

// want to set age to 40 if it is less than than 40
db.users.updateOne({ name: 'Chris' }, { $max: { age: 40 } });

// multiple the age
db.users.updateOne({ name: 'Chris' }, { $mul: { age: 1.1 } });

/**
 * @operator unset
 *
 * @description
 * will remove either value
 */

db.users.updateMany({ isSporty: true }, { $unset: { ph: 1 } });

/**
 * @operator rename
 *
 * @description
 * will rename the field
 */

//  renames the field age to totalAge
db.users.updateMany({}, { $rename: { age: 'totalAge' } });

/**
 * @option upsert
 *
 * @description
 * will either update if present or will insert if not present in collection
 */

db.users.updateOne(
  { name: 'Maria' },
  { $set: { age: 29, hobbies: [{ title: 'Sports', frequency: 2 }] } },
  { upsert: true }
);

/**
 * @summary ARRAY OPERAATORS
 *
 * $ - can be used to add a field or match the first array element on the condition
 * @see not useful incase you want to update multiple elemnts in the array that match the condition
 */

// adds high frequency to the matched array element whose title is sports and frequent is greater than or equal to 3
db.users.updateMany(
  { hobbies: { $elemMatch: { title: 'Sports', frequency: { $gte: 3 } } } },
  { $set: { 'hobbies.$.highFrequency': true } }
);

// To update all array matches
db.users.updateMany(
  { totalAge: { $gt: 30 } },
  {
    $inc: { 'hobbies.$[].frequency': -1 },
  }
);

db.users.updateMany(
  { 'hobbies.frequency': { $gte: 2 } },
  { $set: { 'hobbies.$[el].goodFrequency': true } },
  { arrayFilters: [{ 'el.frequency': { $gte: 2 } }] }
);

/**
 * @operator push
 *
 * @description
 * will add fields to the array
 */

// Single element push
db.users.updateOne({ name: 'Maria' }, { $push: { hobbies: { title: 'Fishing', frequency: 1 } } });

// Multiple push with sort
db.users.updateOne(
  { name: 'Maria' },
  {
    $push: {
      hobbies: {
        $each: [
          { title: 'Snoring', frequency: 3 },
          { title: 'Dreaming', frequency: 7 },
        ],
        $sort: { frequency: -1 },
      },
    },
  }
);

/**
 * @operator pull
 *
 * @description
 * will remove based on condition
 */

db.users.updateOne({ name: 'Maria' }, { $pull: { hobbies: { title: 'Dreaming' } } });

/**
 * @operator pop
 *
 * @description
 * will remove either first or last element from the array
 */

// Remove last element of array
db.users.updateOne({ name: 'Maria' }, { $pop: { hobbies: 1 } });

// Remove first element of array
db.users.updateOne({ name: 'Maria' }, { $pop: { hobbies: -1 } });

/**
 * @operator addToSet
 *
 * @description
 * will add unique elements to the array
 */

// Add single element to array similar to push but once you add once duplicates will not be added
db.users.updateOne({ name: 'Maria' }, { $addToSet: { hobbies: { title: 'Hiking', frequency: 2 } } });
// will not add duplicates
db.users.updateOne({ name: 'Maria' }, { $addToSet: { hobbies: { title: 'Hiking', frequency: 2 } } });

//#endregion

//#region DELETE OPERATIONS

db.users.deleteOne({ name: 'Chris' });

db.users.deleteMany({ totalAge: { $exists: false }, isSporty: true });

// delete everything
db.users.deleteMany({});

//#endregion

//#region INDEXING

db.contacts.createIndex({ 'dob.age': 1 });

//#endregion

//#region GEOSPATIAL DATA

db.places.insertOne({
  name: 'CALIFORNIA INSTITUTE OF SCIENCE AND TECHNOLOGY',
  location: { type: 'Point', coordinates: [-118.663624, 34.2652055] },
});

db.places.createIndex({ location: '2dsphere' });

db.places
  .find({
    location: { $near: { $geometry: { type: 'Point', coordinates: [-118.66819446907589, 34.26470007465575] } } },
  })
  .pretty();

db.places
  .find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [-118.66823126211511, 34.265076866567874],
        },
        $minDistance: 10,
        $maxDistance: 30,
      },
    },
  })
  .pretty();

db.places.insertMany([
  {
    name: 'Corriganville Park',
    location: { type: 'Point', coordinates: [-118.64947380427303, 34.26696894802071] },
  },
  {
    name: 'Baja Fresh',
    location: { type: 'Point', coordinates: [-118.71717032456716, 34.285031313813725] },
  },
  {
    name: 'Mount Sinai Simi Valley',
    location: { type: 'Point', coordinates: [-118.70199384624229, 34.29226532778784] },
  },
]);

//#endregion

//#region AGGREGATION FRAMEWORK

db.persons.aggregate([
  { $match: { gender: 'female' } },
  { $group: { _id: { state: '$location.state' }, totalPersons: { $sum: 1 } } },
  { $sort: { totalPersons: -1 } },
]);

db.persons.aggregate([
  {
    $project: {
      _id: 0,
      gender: 1,
      fullName: {
        $concat: [
          { $toUpper: { $substrCP: ['$name.first', 0, 1] } },
          { $substrCP: ['$name.first', 1, { $subtract: [{ $strLenCP: '$name.first' }, 1] }] },
          ' ',
          { $toUpper: { $substrCP: ['$name.last', 0, 1] } },
          { $substrCP: ['$name.last', 1, { $subtract: [{ $strLenCP: '$name.last' }, 1] }] },
        ],
      },
    },
  },
]);

db.persons.aggregate([
  {
    $project: {
      _id: 0,
      name: 1,
      email: 1,
      birthDate: { $convert: { input: '$dob.date', to: 'date' } },
      age: '$dob.age',
      location: {
        type: 'Point',
        coordinates: [
          { $convert: { input: '$location.coordinates.longitude', to: 'double', onError: 0.0, onNull: 0.0 } },
          { $convert: { input: '$location.coordinates.latitude', to: 'double', onError: 0.0, onNull: 0.0 } },
        ],
      },
    },
  },
  {
    $project: {
      gender: 1,
      location: 1,
      email: 1,
      birthDate: 1,
      age: 1,
      fullName: {
        $concat: [
          { $toUpper: { $substrCP: ['$name.first', 0, 1] } },
          { $substrCP: ['$name.first', 1, { $subtract: [{ $strLenCP: '$name.first' }, 1] }] },
          ' ',
          { $toUpper: { $substrCP: ['$name.last', 0, 1] } },
          { $substrCP: ['$name.last', 1, { $subtract: [{ $strLenCP: '$name.last' }, 1] }] },
        ],
      },
    },
  },
  {
    $group: { _id: { birthYear: { $isoWeekYear: '$birthDate' } }, numPersons: { $sum: 1 } },
  },
  { $sort: { numPersons: -1 } },
]);

db.friends.aggregate([{ $group: { _id: { age: '$age' }, allHobbies: { $push: '$hobbies' } } }]).pretty();

db.friends.aggregate([
  { $unwind: '$hobbies' },
  { $group: { _id: { age: '$age' }, allHobbies: { $push: '$hobbies' } } },
]);

db.friends.aggregate([
  { $unwind: '$hobbies' },
  { $group: { _id: { age: '$age' }, allHobbies: { $addToSet: '$hobbies' } } },
]);

db.friends.aggregate([{ $project: { _id: 0, examScore: { $slice: ['$examScores', 1] } } }]);

db.friends.aggregate([{ $project: { _id: 0, examScore: { $slice: ['$examScores', -1] } } }]);

db.friends.aggregate([{ $project: { _id: 0, numScores: { $size: '$examScores' } } }]);

db.friends.aggregate([
  { $project: { _id: 0, scores: { $filter: { input: '$examScores', as: 'sc', cond: { $gt: ['$$sc.score', 60] } } } } },
]);

db.friends.aggregate([
  { $project: { _id: 0, score: { $filter: { input: '$examScores', as: 'sc', cond: { $gt: ['$$sc.score', 60] } } } } },
]);

db.friends.aggregate([
  { $unwind: '$examScores' },
  { $project: { _id: 1, score: '$examScores.score', name: 1, age: 1 } },
  { $sort: { score: -1 } },
  { $group: { _id: '$_id', name: { $first: '$name' }, maxScore: { $max: '$score' } } },
  { $sort: { maxScore: -1 } },
]);

db.persons.aggregate([
  {
    $bucket: {
      groupBy: '$dob.age',
      boundaries: [0, 18, 30, 50, 80, 120],
      output: {
        numPersons: { $sum: 1 },
        avgAge: { $avg: '$dob.age' },
      },
    },
  },
]);

db.persons.find({ $or: [{ 'dob.age': { $lte: 18 } }, { 'dob.age': { $gte: 80 } }] });

db.persons.aggregate([
  {
    $project: {
      _id: 0,
      name: { $concat: ['$name.first', ' ', '$name.last'] },
      birthDate: { $convert: { input: '$dob.date', to: 'date' } },
    },
  },
  { $sort: { birthDate: 1 } },
  { $skip: 10 },
  { $limit: 10 },
]);
//#endregion
