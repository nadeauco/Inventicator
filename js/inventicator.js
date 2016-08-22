var apiURL = 'http://inventicator.dev/source.json';

var vueModel = {

	el: '#inventicatorApp',

	data: {

		source: {},
		questions: {},
		currentAnswers: {},
		currentScores: {}

	},

	computed: {

		developmentStatusTotal: function()
		{

			// =IF(
			//  F24=-30,
			//  (+E6*(((+E46+(2*E35))/4))+F33-30),
			//  (+E6*(((+F24+E46+(2*E35))/4))+F33)
			// )

			if ( this.getAnswer('searchResults') == 'noSearch' )
			{
				var score = this.getScore('prototype') * ( ( ( this.getScore('trademark') + ( 2 * this.getScore('patent') ) ) / 4 ) ) + this.getScore('priorArtSearch') - 30;
			}
			else
			{
				var score = this.getScore('prototype') * ( ( ( this.getScore('searchResults') + this.getScore('trademark') + ( 2 * this.getScore('patent') ) ) / 4 ) ) + this.getScore('priorArtSearch');
			}

			return score;

		},

		totals: function()
		{
			return {
				developmentStatus: this.developmentStatusTotal
			};
		}

	},

	methods: {

		fetchData: function ()
		{

			console.log("Loading...");
			this.$http.get(apiURL).then(
				function(data) {
					console.log(data);
					this.source = data.data;
					console.log("Loaded.");
					Vue.nextTick(this.setUpQuestions);
					Vue.nextTick(this.setUpCurrentData);
					return true;
				},
				function(data)  {
					console.log("Error.");
					console.log(data);
					return false;
				}
			);

		},

		setUpQuestions: function()
		{

			console.log("setUpQuestions()");

			// Load in questions from source.
			this.$set('questions', this.source.questions);

			// Assign handles from keys.
			for (var handle in this.questions) {
				this.$set('questions.' + handle + '.handle', handle);
				this.$set('questions.' + handle + '.currentAnswer', '');
				this.$set('questions.' + handle + '.currentScore', 0);
			}

		},

		setUpCurrentData: function()
		{

			console.log("setUpCurrentData()");

			for (var handle in this.questions) {
				this.$set('currentAnswers.' + handle, '');
				this.$set('currentScores.' + handle, '');
				this.$watch(
					'questions.' + handle + '.currentAnswer',
					(function(handle){
						return function(newVal, oldVal)
						{
							console.log(handle, "answer changed from", oldVal, "to", newVal);
							this.$set('currentAnswers.' + handle, newVal);
							this.$set('currentScores.' + handle, this.$get('questions.' + handle + '.options.' + newVal + '.score'));
						};
					})(handle)
				);
			}

		},

		getScore: function(handle)
		{
			return this.$get('questions.' + handle + '.currentScore');
		},

		getAnswer: function(handle)
		{
			return this.$get('questions.' + handle + '.currentAnswer');
		}

	},

	created: function ()
	{
		this.fetchData();
	}

};

var QuestionInput = Vue.extend({
	props: ['handle', 'questionType'],
	template: '#tmp-inv-question',
	created: function()
	{
		this.question = I.$get('questions.' + this.handle);
		this.$options.template = '#tmp-inv-question-' + this.question.type;
		this.inputName = "selections[" + this.question.handle + "]";
	}
});

Vue.component('inv-question', QuestionInput);

var I = new Vue(vueModel);
