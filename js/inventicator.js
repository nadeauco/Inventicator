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

		currentAnswers: function currentAnswers()
		{

			var currentAnswers = {};

			for (var handle in this.questions) {

				currentAnswers[handle] = this.$get('questions.' + handle + '.currentAnswer');

			}

			return currentAnswers;

		},

		currentScores: function currentScores()
		{

			var currentScores = {};

			for (var handle in this.questions) {

				var question = this.$get('questions.' + handle);
				var currentAnswer = this.$get('questions.' + handle + '.currentAnswer');
				var currentScore = 0;

				if (question.type == 'select')
				{

					currentScore = this.$get('questions.' + handle + '.options.' + currentAnswer + '.score') || 0;

				}
				else if (question.type == 'multiselect')
				{

					for (var i=0; i < currentAnswer.length; i++)
					{

						if (currentAnswer[i])
						{
							var optionScore = this.$get('questions.' + handle + '.options.' + currentAnswer[i] + '.score') || 0;
							currentScore += optionScore;
						}

					}

				}
				else if (question.type == 'plusminus')
				{

					for (var i=0; i < currentAnswer.length; i++)
					{

						if (currentAnswer[i])
						{
							var currentOption = currentAnswer[i].substr(1);
							var currentOperator = currentAnswer[i].substr(0,1);
							var optionValue = this.$get('questions.' + handle + '.options.' + currentOption + '.score') || 0;
							currentScore += (currentOperator == '-' ? -1*optionValue : optionValue);
						}

					}

				}
				else
				{
					// currentScore = 0
				}

				currentScores[handle] = currentScore;

			}

			return currentScores;

		},

		developmentStatusTotal: function developmentStatusTotal()
		{

			var prototypeStatus = this.getScore('prototypeStatus');
			var trademark = this.getScore('trademark');
			var patent = this.getScore('patent');
			var priorArtSearch = this.getScore('priorArtSearch');

			// =IF(
			//  F24=-30,
			//  (+E6*(((+E46+(2*E35))/4))+F33-30),
			//  (+E6*(((+F24+E46+(2*E35))/4))+F33)
			// )

			if ( this.getAnswer('searchResults') == 'noSearch' )
			{
				var score = prototypeStatus * ( ( ( trademark + ( 2 * patent ) ) / 4 ) ) + priorArtSearch - 30;
			}
			else
			{
				var score = prototypeStatus * ( ( ( trademark + ( 2 * patent ) ) / 4 ) ) + priorArtSearch;
			}

			console.log("Recalculated developmentStatusTotal: " + score);

			return score;

		},

		salesChannelTotal: function salesChannelTotal()
		{

			var competition = this.getScore('competition');
			var categoryHype = this.getScore('categoryHype');
			var marketEntry = this.getScore('marketEntry');

			// =(+E59+E70+F90)

			var score = 0; // TODO

			console.log("Recalculated salesChannelTotal: " + score);

			return score;

		},

		compareToAlternativesTotal: function compareToAlternativesTotal()
		{

			var timeSavings = this.getScore('timeSavings');
			var moneySavings = this.getScore('moneySavings');
			var otherBenefits = this.getScore('otherBenefits');
			var influentials = this.getScore('influentials');

			// =(E96*(F105*F106))+(E108*(F117*F118))+(E141+F151)

			var score = 0; // TODO

			console.log("Recalculated compareToAlternativesTotal: " + score);

			return score;

		},

		conceptStrengthTotal: function conceptStrengthTotal()
		{

			var problemStrength = this.getScore('problemStrength');
			var difference = this.getScore('difference');
			var standAloneProduct = this.getScore('standAloneProduct');
			var clearBenefits = this.getScore('clearBenefits');

			// =(E156*(F165*F166))+(E168*(F177*F178))+E180+E191

			var score = 0; // TODO

			console.log("Recalculated conceptStrengthTotal: " + score);

			return score;

		},

		marketTotal: function marketTotal()
		{

			var marketConsumer = this.getScore('marketConsumer');
			var marketNonConsumer = this.getScore('marketNonConsumer');
			var marketSize = this.getScore('marketSize');
			var userWantToBuy = this.getScore('userWantToBuy');
			var buyingDecision = this.getScore('buyingDecision');
			var seasonalOrYear = this.getScore('seasonalOrYear');

			// =(E244*F242/3)-((7-E255)*7)-(7-E262)

			var score = 0; // TODO

			console.log("Recalculated marketTotal: " + score);

			return score;

		},

		profitInvestmentTotal: function profitInvestmentTotal()
		{

			var retailCost = this.getScore('retailCost');
			var mvpCost = this.getScore('mvpCost');

			// =+D294+E285

			var score = 0; // TODO

			console.log("Recalculated profitInvestmentTotal: " + score);

			return score;

		},

		feasibilityTotal: function feasibilityTotal()
		{

			var canItBeMade = this.getScore('canItBeMade');
			var regulations = this.getScore('regulations');

			// =IF(E320>-10000,E320,"Violates Laws of Physics")

			var score = 0; // TODO

			console.log("Recalculated feasibilityTotal: " + score);

			return score;

		},

		socialEconomicConsiderationsTotal: function socialEconomicConsiderationsTotal()
		{

			var socialEconomicConsiderations = this.getScore('socialEconomicConsiderations');

			// =+(B335-C335)*5

			var score = socialEconomicConsiderations * 5;

			console.log("Recalculated socialEconomicConsiderationsTotal: " + score);

			return score;

		},

		totals: function()
		{
			return {
				developmentStatus: this.developmentStatusTotal,
				salesChannel: this.salesChannelTotal,
				compareToAlternatives: this.compareToAlternativesTotal,
				conceptStrength: this.conceptStrengthTotal,
				market: this.marketTotal,
				profitInvestment: this.profitInvestmentTotal,
				feasibility: this.feasibilityTotal,
				socialEconomicConsiderations: this.socialEconomicConsiderationsTotal
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
			for (var handle in this.source.questions) {

				var question = this.$get('source.questions.' + handle);
				var componentName = ('inv-question' + (question.type ? '-' + question.type : ''));

				this.$set('questions.' + handle + '.handle', handle);
				this.$set('questions.' + handle + '.componentName', componentName);

				if (question.type == 'multiselect' || question.type == 'plusminus')
				{
					this.$set('questions.' + handle + '.currentAnswer', []);
				}
				else
				{
					this.$set('questions.' + handle + '.currentAnswer', '');
				}

			}

		},

		getScore: function(handle)
		{
			return this.$get('currentScores.' + handle) || 0;
		},

		getAnswer: function(handle)
		{
			return this.$get('currentAnswers' + handle);
		}

	},

	created: function()
	{
		this.fetchData();
	}

};

var QuestionInput = Vue.extend({
	props: ['handle'],
	template: '#tmp-inv-question',
	data: function()
	{
		return {
			'question': this.$parent.$get('questions.' + this.handle)
		}
	},
	created: function()
	{
		this.inputName = "selections[" + this.handle + "]";
	}
});

var SelectQuestionInput = QuestionInput.extend({
	template: '#tmp-inv-question-select'
});

var MuliSelectQuestionInput = QuestionInput.extend({
	template: '#tmp-inv-question-multiselect'
});

var PlusMinusQuestionInput = QuestionInput.extend({
	template: '#tmp-inv-question-plusminus'
});


Vue.component('inv-question', QuestionInput);
Vue.component('inv-question-select', SelectQuestionInput);
Vue.component('inv-question-multiselect', MuliSelectQuestionInput);
Vue.component('inv-question-plusminus', PlusMinusQuestionInput);

var I = new Vue(vueModel);
