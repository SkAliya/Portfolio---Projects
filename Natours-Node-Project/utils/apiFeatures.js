class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A FILTER
    let queryObj = { ...this.queryString };
    const excludeQueries = ['sort', 'page', 'limit', 'fields'];
    excludeQueries.forEach((el) => delete queryObj[el]);

    //  1B ADVANCED FILTER
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lt|gt|lte|gte)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      console.log(this.queryString.sort);
      let sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  fields() {
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      console.log(fields);
    } else {
      // this.query = this.query.select('-__v').select('-name');
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = Number(this.queryString.page) || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // dont need to check for if theres no pages skips r more
    // if (req.query.page) {
    //   const numOfTours = await Tour.countDocuments();
    //   if (skip >= numOfTours) throw new Error('This page does not exits!');
    // }
    // }
    return this;
  }
}

module.exports = APIFeatures;
