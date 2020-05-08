const Category = require('../models/Category');

function renderResults(categories) {
  if (!categories) {
    return [];
  }

  let result = [];
  for (let category of categories) {
    let categoryObj = {
      id: category._id,
      title: category.title,
      subcategories: []
    };

    for (let subcategory of category.subcategories) {
      let subCategoryObj = {
        id: subcategory._id,
        title: subcategory.title
      };

      categoryObj.subcategories.push(subCategoryObj);
    }

    result.push(categoryObj);
  }

  return result;
}

module.exports.categoryList = async function categoryList(ctx) {
  const categories = await Category.find({});
  ctx.body = {categories: renderResults(categories)};
};
