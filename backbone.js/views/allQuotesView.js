window.QuoteListView = Backbone.View.extend({
  tagName: "table",
  id: "myTable",
  className: "tablesorter",


  initialize: function() {
    this.collection.on('change', this.render, this);
    this.render();
  },

  render: function() {
    this.$el.children().detach();

    this.$el.html('<th>Source</th> <th>Quote</th> <th>Theme</th>').append(
      this.collection.map(function(quote){
        return new QuoteEntryView({ model: quote }).render();
      })
      
    );

  }

});