Parse.initialize("xp79nE0rqZ1g1VPGkJuE2pevNlfDfREkXjsRYq8m", "Mio2GErerKkNZVeZj21TTQD4YvrWAgVxZWOgLez7");

var category = Parse.Object.extend("Category");
var day = Parse.Object.extend("Day");
var card = Parse.Object.extend("Card");

var templateCard = $("#card").html();
var us_templateCard = _.template(templateCard);
var templateCardRow = $("#cardRow").html();
var us_templateCardRow = _.template(templateCardRow);
var createCard = function(card,cardRow,id) {
              cardRow = cardRow.replace(/[\s.:]+/g, '')
              card.id = id;
              $("#" + cardRow + "Cards").append(us_templateCard(card));
            };
var createCardRow = function(cardRow,type) {
              cardRow.Type = type;
              $("#" + type).append(us_templateCardRow(cardRow));
            };

findCardRows();
bindEvents();

function findCardRows () {
  //Get and draw all the categories in the database
  var categoryQuery = new Parse.Query(category);
  categoryQuery.find({
    success: function(results) {
      results.forEach(function(result){
        createCardRow(result.attributes,"category");
        var cardRowId = result.id;
        var cardRowTitle = result.attributes.Name;
	      $("#categorySelect").append("<option>"+cardRowTitle+"</option>");
        findCards("Category",cardRowId,cardRowTitle);
      });
    },
    error: function(error) {
          // error is an instance of Parse.Error.
      }
  })
  //Get and draw all the days in the database
  var dayQuery = new Parse.Query(day);
  dayQuery.ascending("Order");
  dayQuery.find({
    success: function(results) {
      results.forEach(function(result){
        createCardRow(result.attributes,"day");
        var cardRowId = result.id;
        var cardRowTitle = result.attributes.Name;
	      $("#daySelect").append("<option>"+cardRowTitle+"</option>");
	      findCards("Day",cardRowId,cardRowTitle);
      });
    },
    error: function(error) {
          // error is an instance of Parse.Error.
      }
  })
}

function findCards (type, objectId, name) {
  //Get and draw all the cards for a <type> with name <name>
  //example usage: findCards("day","Monday");
  var cardQuery = new Parse.Query(card);
  var rowObj;
	if (type == "Category") {
		rowObj = new category();
	} else if (type == "Day") {
		rowObj = new day();
	}
  rowObj.id = objectId;
  cardQuery.equalTo(type,rowObj);
  cardQuery.find({
    success: function(results) {
      results.forEach(function(result){
        createCard(result.attributes,name,result.id);
      });
    },
    error: function(error) {
          // error is an instance of Parse.Error.
      }
  })
}

function bindEvents() {
  $(document).on('click', '.editCard', function() {
    var id = $(this).attr('id');
    $("#modalCardId").val(id);
    var cardQuery = new Parse.Query(card);
    cardQuery.get(id, {
      success: function(result) {
        cardData = result.attributes;
        $("#cardText").val(cardData.Text);
        cardData.Category.fetch({
          success: function(category) {
            $("#categorySelect").val(category.get('Name'));
          }
        });
        if (cardData.Day){
          cardData.Day.fetch({
            success: function(day) {
              $("#daySelect").val(day.get('Name'));
            }
          });
        };
      },
      error: function(object, error) {
        // The object was not retrieved successfully.
        // error is a Parse.Error with an error code and message.
      }
    });
  });

	$("#saveCard").click(function() {
		newCard = new card();
    console.log("hello");
    if ($("#modalCardId").val()){
      newCard.id = $("#modalCardId").val();
    }
		
		var categoryQuery = new Parse.Query(category);
		categoryQuery.equalTo("Name",$("#categorySelect").val());
		categoryQuery.find({
			success: function(results) {
			  results.forEach(function(result){
  				var categoryId = result.id;
  				var newCardCategory = new category();
  				newCardCategory.id = categoryId;
  				newCard.set("Category",newCardCategory);
			  });
			},
			error: function(error) {
				  // error is an instance of Parse.Error.
			}
		}).then(function(){
			var dayQuery = new Parse.Query(day);
			dayQuery.equalTo("Name",$("#daySelect").val());
			return dayQuery.find({
				success: function(results) {
				  results.forEach(function(result){
  					var dayId = result.id;
  					var newCardDay = new day();
  					newCardDay.id = dayId;
  					newCard.set("Day",newCardDay);
				  });
          if (results.length == 0){
            newCard.set("Day",null);
          };
				},
				error: function(error) {
					  console.log(error);
				}
			})
		}).then(function(){	
		  newCard.set("Text", $("#cardText").val());
    
		
  		newCard.save(null, {
  		  success: function(newCard) {
  			// Execute any logic that should take place after the object is saved.
  			location.reload();
  		  },
  		  error: function(newCard, error) {
  			// Execute any logic that should take place if the save fails.
  			// error is a Parse.Error with an error code and message.
  			alert('Failed to create new object, with error code: ' + error.message);
  		  }
  		});
	  });
  });

  $(document).on('click', '.deleteCard', function(){
    var cardQuery = new Parse.Query(card);
    var myCard;
    cardQuery.get($(this).attr('id'), {
      success: function(result) {
        myCard = result;
      },
      error: function(object, error) {
        // The object was not retrieved successfully.
        // error is a Parse.Error with an error code and message.
      }
    }).then( function() {
      return myCard.destroy({
        success: function(myObject) {
          
        },
        error: function(myObject, error) {
          // The delete failed.
          // error is a Parse.Error with an error code and message.
        }
      })
    })
  })

  $(document).on('click', '.addCard', function() {
    $("#modalCardId").val("");
    $("#daySelect").val("");
    $("#cardText").val("");
    var categoryName = $(this).prev().text();
    $("#categorySelect").val(categoryName);
  });
};