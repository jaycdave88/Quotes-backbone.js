window.QuoteEntryView = Backbone.View.extend({
  tagName: "tr",

  template: _.template('<td><%- source %></td> <td>"<%- quote %>"</td> <td><%- theme %></td>'),

  render: function() {
    return this.$el.html(this.template(this.model.attributes));
  }

});